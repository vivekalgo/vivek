"""
AI Legal Sentinel - Backend API
Analyzes Indian contracts for risky clauses
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import pdfplumber
from docx import Document
import io
import re
import os
import sys
import socket

# Force UTF-8 encoding for stdout/stderr to handle emojis on Windows
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

def sanitize_text(text: str) -> str:
    """
    Universal text sanitization to prevent Unicode crashes on Windows.
    Removes emojis and forces UTF-8 compliance.
    """
    if not text:
        return ""
    
    # 1. Force UTF-8 encoding/decoding
    text = text.encode("utf-8", "ignore").decode("utf-8")
    
    # 2. Remove emojis and symbols (Surrogate pairs & specific ranges)
    # Remove chars in Supplemental Multilingual Plane (10000-10FFFF) where emojis live
    text = re.sub(r'[\U00010000-\U0010ffff]', '', text)
    
    # 3. Remove other common problematic symbols if necessary (e.g. decorative)
    # Keep it simple for now as per requirements
    
    return text

# Load environment variables from .env file FIRST
try:
    from dotenv import load_dotenv
    load_dotenv()
    load_dotenv('geminikey.env') # Load specific env file if present
    print("[OK] Loaded environment variables from .env and geminikey.env")
except ImportError:
    print("[WARN] python-dotenv not installed, using system environment variables")

# Configure Gemini AI with API Key Rotation AFTER loading .env
try:
    import google.generativeai as genai
    from api_key_manager import initialize_key_manager, get_key_manager
    
    AI_AVAILABLE = True
    
    # Load all API keys from environment
    api_keys = [
        os.getenv("GEMINI_API_KEY_1", ""),
        os.getenv("GEMINI_API_KEY_2", ""),
        os.getenv("GEMINI_API_KEY_3", ""),
        os.getenv("GEMINI_API_KEY_4", ""),
    ]
    
    # Filter out empty keys
    valid_keys = [key for key in api_keys if key and key.strip()]
    
    print(f"[INFO] Found {len(valid_keys)} valid API keys in environment")
    
    if valid_keys:
        # Initialize the API key manager with rotation
        key_manager = initialize_key_manager(valid_keys)
        AI_MODEL = True  # Flag to indicate AI is available
        print(f"[OK] API Key Manager initialized with {len(valid_keys)} keys")
        print(f"[OK] Automatic failover enabled for quota exhaustion")
    else:
        key_manager = None
        AI_MODEL = None
        print("[WARN] No valid API keys found in environment variables")
except Exception as e:
    AI_AVAILABLE = False
    AI_MODEL = None
    key_manager = None
    print(f"[ERROR] Error configuring Gemini API: {e}")

def generate_with_retry(prompt, max_retries=3):
    """
    Generate content with automatic API key rotation on quota errors.
    Completely transparent to the user - tries all available keys.
    """
    if not AI_MODEL:
        raise Exception("AI Model not initialized")
    
    # Use the API key manager for automatic rotation
    manager = get_key_manager()
    
    if not manager:
        raise Exception("API Key Manager not initialized")
    
    # Try to generate with automatic key rotation
    # The manager will automatically try all keys if quota errors occur
    response = manager.generate_with_rotation(
        prompt=prompt,
        model_name='gemini-flash-latest',
        max_attempts=None  # Try all available keys
    )
    
    if response is None:
        # All keys exhausted - raise exception for fallback handling
        raise Exception("All API keys exhausted. Please try again later.")
    
    return response

app = FastAPI(title="AI Legal Sentinel - India")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon demo only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== RAG SYSTEM INITIALIZATION =====

from vector_store import initialize_vector_store, get_vector_store
from rag_agent import initialize_rag_agent, get_rag_agent

# Get absolute paths for law files
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
LAW_FILE_PATH = os.path.join(BACKEND_DIR, "laws", "indian_contract_act.txt")
NDA_FILE_PATH = os.path.join(BACKEND_DIR, "laws", "nda_clauses_explanations.txt")

# Try to initialize vector store with embeddings
try:
    from vector_store_embeddings import initialize_vector_store as init_vector_embeddings, get_vector_store as get_vector_embeddings
    VECTOR_EMBEDDINGS_AVAILABLE = True
    print("[OK] Vector embeddings support available")
except ImportError:
    VECTOR_EMBEDDINGS_AVAILABLE = False
    print("[WARN] Vector embeddings not available, using keyword-based retrieval")

# Initialize RAG system on startup
@app.on_event("startup")
async def startup_event():
    """Initialize vector store and RAG agent when app starts."""
    print("\n" + "="*60)
    print("[START] Starting AI Legal Sentinel - RAG Edition")
    print("="*60)
    
    # Initialize vector store with Indian Contract Act and NDA clauses
    initialize_vector_store(
        law_file_path=LAW_FILE_PATH,
        nda_file_path=NDA_FILE_PATH
    )
    
    # Initialize vector embeddings store if available
    if VECTOR_EMBEDDINGS_AVAILABLE:
        try:
            init_vector_embeddings(
                law_file_path=LAW_FILE_PATH,
                nda_file_path=NDA_FILE_PATH
            )
            print("[OK] Vector embeddings initialized successfully")
        except Exception as e:
            print(f"[WARN] Could not initialize vector embeddings: {e}")
    
    # Initialize RAG agent
    initialize_rag_agent()
    
    print("="*60)
    print("[OK] RAG System Ready with Contract Knowledge Base!")
    print("="*60 + "\n")


# ===== TEXT EXTRACTION =====

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    text = ""
    with pdfplumber.open(io.BytesIO(file_content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return sanitize_text(text)


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    doc = Document(io.BytesIO(file_content))
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return sanitize_text(text)


# ===== CLAUSE SPLITTING =====

def split_into_clauses(text: str) -> List[str]:
    """
    Split contract text into individual clauses
    Uses newlines and numbered points as separators
    """
    # First, split by double newlines (paragraphs)
    paragraphs = text.split('\n\n')
    
    clauses = []
    for para in paragraphs:
        # Check if paragraph starts with numbering (1., 2., a., etc.)
        # Also split by single newlines if they contain numbered points
        lines = para.split('\n')
        
        current_clause = ""
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if line starts with numbering pattern
            if re.match(r'^[\d]+\.|\([a-z]\)|\([0-9]+\)|^[A-Z]\.', line):
                # Save previous clause if exists
                if current_clause:
                    clauses.append(current_clause.strip())
                current_clause = line
            else:
                current_clause += " " + line
        
        # Add the last clause
        if current_clause:
            clauses.append(current_clause.strip())
    
    # Filter out very short clauses (likely headers or noise)
    clauses = [c for c in clauses if len(c) > 20]
    
    return clauses


# ===== AI ENHANCEMENT LAYER (OPTIONAL) =====

def enhance_explanation_with_ai(clause_data: Dict) -> Dict:
    """
    Optional AI enhancement layer to make explanations more conversational.
    
    IMPORTANT: This function does NOT:
    - Change risk levels
    - Add new legal interpretations
    - Modify law references
    - Make legal decisions
    
    It ONLY rewrites existing explanations in simpler language.
    Falls back to original if AI fails.
    """
    if not AI_MODEL:
        # No AI available or no API key - return original
        return clause_data
    
    try:
        # Create prompt that constrains AI to only simplify, not add new content
        prompt = f"""You are helping explain a contract clause to an Indian freelancer with no legal background.

STRICT RULES:
1. DO NOT add new legal interpretations
2. DO NOT change the risk level
3. DO NOT mention laws other than the one provided
4. ONLY rewrite the explanation in simpler, more conversational language
5. Keep the same meaning, just make it easier to understand

GIVEN INFORMATION:
Clause Type: {clause_data['clause_type']}
Risk Level: {clause_data['risk_level']} (DO NOT CHANGE THIS)
Risk Score: {clause_data['risk_score']}/10 (DO NOT CHANGE THIS)
Law Reference: {clause_data['applicable_law_section']}
Original Explanation: {clause_data['why_risky']}

TASK: Rewrite the explanation in 2-3 simple sentences that a non-lawyer can understand. Use conversational language but keep the same legal meaning.

Simplified Explanation:"""

        response = AI_MODEL.generate_content(prompt)
        simplified_explanation = response.text.strip()
        
        # Validate that AI didn't go rogue
        if simplified_explanation and len(simplified_explanation) > 20:
            # Add AI-enhanced version while keeping original as fallback
            clause_data['why_risky_ai'] = simplified_explanation
            clause_data['ai_enhanced'] = True
        
        return clause_data
        
    except Exception as e:
        # AI failed - return original data unchanged
        print(f"AI enhancement failed: {e}")
        clause_data['ai_enhanced'] = False
        return clause_data


# ===== RULE-BASED RISK DETECTION =====

def detect_non_compete(clause: str) -> bool:
    """Detect non-compete / restraint of trade clauses"""
    keywords = [
        "non-compete", "non compete", "noncompete",
        "restraint of trade", "shall not engage",
        "prohibited from engaging", "restrict", "restriction",
        "covenant not to compete", "not to carry on"
    ]
    clause_lower = clause.lower()
    return any(keyword in clause_lower for keyword in keywords)


def detect_ip_transfer(clause: str) -> bool:
    """Detect intellectual property ownership transfer clauses"""
    keywords = [
        "intellectual property", "ip rights",
        "ownership", "assign", "assignment",
        "all rights", "transfer of rights",
        "copyright", "patent", "trademark",
        "work for hire", "work made for hire"
    ]
    clause_lower = clause.lower()
    return any(keyword in clause_lower for keyword in keywords)


def detect_unlimited_liability(clause: str) -> bool:
    """Detect unlimited liability / indemnity clauses"""
    keywords = [
        "unlimited liability", "indemnify", "indemnification",
        "hold harmless", "defend and hold harmless",
        "liability without limit", "unconditional liability",
        "absolute liability", "shall be liable for all"
    ]
    clause_lower = clause.lower()
    return any(keyword in clause_lower for keyword in keywords)


def detect_penalty_clause(clause: str) -> bool:
    """Detect penalty clauses (Section 74, Indian Contract Act)"""
    keywords = [
        "penalty", "penalties", "penal",
        "forfeit", "forfeiture",
        "fine", "fines",
        "punitive damages", "penalty amount",
        "shall pay a penalty", "penalty of"
    ]
    clause_lower = clause.lower()
    return any(keyword in clause_lower for keyword in keywords)


def detect_unfair_termination(clause: str) -> bool:
    """Detect unfair termination clauses"""
    keywords = [
        "terminate without cause", "termination without reason",
        "terminate at will", "immediate termination",
        "terminate without notice", "no notice period",
        "termination at sole discretion"
    ]
    clause_lower = clause.lower()
    return any(keyword in clause_lower for keyword in keywords)


def analyze_clause(clause: str) -> Dict:
    """
    Analyze a single clause for risks
    Returns enhanced risk details if risky, None otherwise
    """
    # Check for non-compete (Section 27)
    if detect_non_compete(clause):
        return {
            "clause_text": clause,
            "clause_type": "Non-Compete / Restraint of Trade",
            "risk_level": "High",
            "risk_score": 9,
            "applicable_law_section": "Section 27, Indian Contract Act, 1872",
            "law_reference": "Section 27, Indian Contract Act, 1872",  # Keep for backward compatibility
            "why_risky": "Non-compete clauses are generally void under Indian law. Section 27 states that any agreement that restrains someone from exercising a lawful profession, trade, or business is void. This means you cannot be legally prevented from working in your field after leaving.",
            "explanation": "This clause may restrict your ability to work in similar fields after leaving. Under Indian law, agreements that restrain someone from exercising a lawful profession are generally void. You should consult a lawyer before signing.",  # Keep for backward compatibility
            "what_user_can_do": [
                "Request complete removal of this clause",
                "If employer insists, negotiate to replace with a confidentiality agreement instead",
                "Consult a lawyer - this clause is likely unenforceable in India",
                "Do not sign without legal advice if this clause remains"
            ],
            "safer_rewrite": "The Employee agrees to maintain confidentiality of all proprietary information and trade secrets for a period of 2 years after termination. This does not restrict the Employee's right to work in similar roles or industries."
        }
    
    # Check for penalty clauses (Section 74)
    if detect_penalty_clause(clause):
        return {
            "clause_text": clause,
            "clause_type": "Penalty Clause",
            "risk_level": "High",
            "risk_score": 8,
            "applicable_law_section": "Section 74, Indian Contract Act, 1872",
            "law_reference": "Section 74, Indian Contract Act, 1872",
            "why_risky": "Under Section 74, penalty clauses are not enforceable in India. Only 'reasonable compensation' for actual loss can be claimed. If the amount mentioned is excessive or punitive rather than compensatory, courts will not enforce it.",
            "explanation": "This clause imposes a penalty for breach of contract. Under Indian law, only reasonable compensation for actual losses can be claimed, not arbitrary penalties.",
            "what_user_can_do": [
                "Request to change 'penalty' to 'liquidated damages'",
                "Ensure the amount is reasonable and proportionate to potential actual loss",
                "Ask for a clear calculation basis for the damages",
                "Negotiate a cap on the liability amount",
                "Seek legal advice if the amount seems excessive"
            ],
            "safer_rewrite": "In case of breach, the Employee shall pay reasonable compensation for actual losses suffered by the Company, not exceeding [reasonable amount based on salary/project value]. This is genuine pre-estimate of loss, not a penalty."
        }
    
    # Check for unlimited liability (Section 23)
    if detect_unlimited_liability(clause):
        return {
            "clause_text": clause,
            "clause_type": "Unlimited Liability / Indemnity",
            "risk_level": "High",
            "risk_score": 9,
            "applicable_law_section": "Section 23, Indian Contract Act, 1872",
            "law_reference": "Section 23, Indian Contract Act, 1872",
            "why_risky": "Unlimited liability clauses can expose you to massive financial risk. Section 23 states that agreements with unlawful objects or against public policy are void. Courts may consider unlimited liability clauses as unconscionable and against public policy.",
            "explanation": "This clause makes you responsible for damages without any limit. This could expose you to significant financial risk. Agreements that are against public policy may be void under Indian law.",
            "what_user_can_do": [
                "Negotiate a reasonable cap on liability (e.g., 3-6 months of salary)",
                "Request limitation to direct damages only (exclude indirect/consequential)",
                "Exclude liability for matters beyond your control",
                "Add mutual liability clause (both parties have same limits)",
                "Do not accept unlimited liability - this is unreasonable"
            ],
            "safer_rewrite": "The Employee's total liability under this agreement shall be limited to direct damages only and shall not exceed three months of the Employee's gross salary. The Employee shall not be liable for indirect, consequential, or punitive damages."
        }
    
    # Check for unfair termination
    if detect_unfair_termination(clause):
        return {
            "clause_text": clause,
            "risk_level": "Medium",
            "risk_score": 6,
            "clause_type": "Unfair Termination Clause",
            "applicable_law_section": "Industrial Disputes Act, 1947 & Contract Act, 1872",
            "law_reference": "Industrial Disputes Act, 1947",
            "why_risky": "Clauses allowing termination without notice or cause can leave you suddenly unemployed without any protection. While 'at-will' employment exists in some countries, Indian labor law generally requires notice periods and just cause for termination in many cases.",
            "explanation": "This clause allows the employer to terminate your employment without notice or cause, which may not provide you adequate job security.",
            "what_user_can_do": [
                "Negotiate a minimum notice period (30-90 days is standard)",
                "Request severance pay if terminated without cause",
                "Ask for clear definition of 'cause' for termination",
                "Ensure mutual termination rights (you can also leave with notice)",
                "Consider requesting a probation period after which this doesn't apply"
            ],
            "safer_rewrite": "Either party may terminate this agreement with 60 days written notice. Termination without notice is only permitted for serious misconduct as defined in the Employee Handbook. If terminated without cause, Employee shall receive severance pay equal to notice period."
        }
    
    # Check for IP transfer
    if detect_ip_transfer(clause):
        return {
            "clause_text": clause,
            "clause_type": "Intellectual Property Transfer",
            "risk_level": "Medium",
            "risk_score": 6,
            "applicable_law_section": "Copyright Act, 1957 & Patent Act, 1970",
            "law_reference": "Copyright Act, 1957",
            "why_risky": "Broad IP transfer clauses can claim ownership of everything you create, even personal projects done outside work hours. Under Indian IP law, you should only assign IP that is directly related to your work duties and created using company resources.",
            "explanation": "This clause transfers ownership of your creative work or inventions to the other party. Make sure you understand what rights you're giving up, especially for work done outside company time.",
            "what_user_can_do": [
                "Limit IP transfer to work done during working hours only",
                "Exclude personal projects and pre-existing IP",
                "Clarify that only IP using company resources is transferred",
                "Request to exclude IP unrelated to company's business",
                "Maintain a list of your pre-existing IP before joining"
            ],
            "safer_rewrite": "The Employee assigns to the Company all intellectual property created during working hours, using Company resources, and directly related to the Company's business. Personal projects and IP created outside working hours using own resources remain the Employee's property."
        }
    
    return None


# ===== API ENDPOINTS =====

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "message": "AI Legal Sentinel - India API",
        "status": "running",
        "disclaimer": "This tool does not provide legal advice."
    }


@app.post("/upload")
async def analyze_contract(file: UploadFile = File(...)):
    """
    Upload and analyze a contract (PDF or DOCX)
    Returns list of risky clauses found
    """
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text based on file type
        filename = file.filename.lower()
        
        if filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_content)
        elif filename.endswith('.docx'):
            text = extract_text_from_docx(file_content)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload PDF or DOCX only."
            )
        
        if not text or len(text) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from file or file is too short."
            )
        
        # Split into clauses
        clauses = split_into_clauses(text)
        
        # Analyze each clause
        risky_clauses = []
        for clause in clauses:
            risk = analyze_clause(clause)
            if risk:
                # Optional: Enhance explanation with AI (only if API key is set)
                risk = enhance_explanation_with_ai(risk)
                risky_clauses.append(risk)
        
        # Calculate overall contract risk score
        overall_risk_score = 0
        overall_risk_category = "Low Risk"
        
        if risky_clauses:
            # Average of all risk scores
            total_score = sum(clause.get("risk_score", 0) for clause in risky_clauses)
            overall_risk_score = round(total_score / len(risky_clauses), 1)
            
            # Categorize overall risk
            if overall_risk_score >= 8:
                overall_risk_category = "High Risk"
            elif overall_risk_score >= 5:
                overall_risk_category = "Medium Risk"
            else:
                overall_risk_category = "Low Risk"
        
        
        # Store contract context in RAG agent for Q&A
        rag_agent = get_rag_agent()
        rag_agent.set_contract_context(
            contract_text=text,
            clauses=clauses,
            risky_clauses=risky_clauses
        )
        
        # Also vectorize contract clauses for semantic search if embeddings available
        if VECTOR_EMBEDDINGS_AVAILABLE:
            try:
                vector_store_emb = get_vector_embeddings()
                vector_store_emb.add_contract_clauses(clauses)
                print(f"[OK] Vectorized {len(clauses)} contract clauses for semantic search")
            except Exception as e:
                print(f"[WARN] Could not vectorize contract clauses: {e}")
        
        # Return results
        return {
            "success": True,
            "total_clauses_analyzed": len(clauses),
            "risky_clauses_found": len(risky_clauses),
            "overall_risk_score": overall_risk_score,
            "overall_risk_category": overall_risk_category,
            "risky_clauses": risky_clauses,
            "all_clauses": [
                {
                    "clause_text": clause,
                    "clause_type": f"Clause {i+1}",  # Simple numbering for non-risky clauses
                    "risk_level": None  # No risk level for non-analyzed clauses
                }
                for i, clause in enumerate(clauses)
            ],
            "disclaimer": "This tool does not provide legal advice. Consult a qualified lawyer for legal matters.",
            "rag_enabled": True  # Indicates Q&A is now available
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )



# ===== HR VALIDATION ENDPOINT =====

from hr_validation_agent import get_hr_validation_agent

@app.post("/hr/validate")
async def validate_hr_contract(file: UploadFile = File(...)):
    """
    Validate an employment contract against Indian Labor Laws.
    Returns compliance score, missing clauses, and clause-by-clause analysis.
    """
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text based on file type
        filename = file.filename.lower()
        
        if filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_content)
        elif filename.endswith('.docx'):
            text = extract_text_from_docx(file_content)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload PDF or DOCX only."
            )
        
        # Sanitize text (Safety first!)
        text = sanitize_text(text)
        
        if not text or len(text) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from file or file is too short."
            )
        
        # Split into clauses
        clauses = split_into_clauses(text)
        
        # Run HR Validation
        hr_agent = get_hr_validation_agent()
        validation_result = hr_agent.validate_contract(clauses)
        
        # --- ENABLE RAG FOR HR MODE ---
        # Store context so user can ask questions about this contract
        rag_agent = get_rag_agent()
        
        # Convert HR risky clauses to RAG format
        # HR agent returns structured dict, we need to adapt it slightly for RAG if needed
        # For now, we'll pass the list of risky clauses found by HR agent
        risky_hr_clauses = [r for r in validation_result.get('clause_results', []) if r['status'] in ['RISKY', 'INVALID']]
        
        rag_agent.set_contract_context(
            contract_text=text,
            clauses=clauses,
            risky_clauses=risky_hr_clauses
        )
        
        # Vectorize clauses if available
        if VECTOR_EMBEDDINGS_AVAILABLE:
            try:
                vector_store_emb = get_vector_embeddings()
                vector_store_emb.add_contract_clauses(clauses)
            except Exception as e:
                print(f"[WARN] HR Vectorization failed: {e}")
        # -----------------------------
        
        return {
            "success": True,
            "filename": file.filename,
            "analysis": validation_result,
            "rag_enabled": True 
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] HR Validation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error validating contract: {str(e)}"
        )


# ===== RAG Q&A ENDPOINT =====

from pydantic import BaseModel

class QuestionRequest(BaseModel):
    """Request model for Q&A endpoint."""
    question: str

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    """
    RAG-based Q&A endpoint.
    Answers questions about uploaded contract using Indian Contract Act knowledge.
    
    Args:
        request: QuestionRequest with user's question
        
    Returns:
        JSON with question, answer, context used, and disclaimer
    """
    try:
        # Get RAG agent
        rag_agent = get_rag_agent()
        
        # Check if contract is loaded
        if not rag_agent.has_contract():
            raise HTTPException(
                status_code=400,
                detail="No contract uploaded. Please upload a contract first using /upload endpoint."
            )
        
        # Retrieve relevant context
        context = rag_agent.retrieve_context(request.question)
        
        # Generate RAG prompt
        prompt = rag_agent.generate_rag_prompt(request.question, context)
        
        # Call LLM (using Gemini if API key is set, otherwise return prompt for manual use)
        answer = None
        if AI_MODEL:
            try:
                response = generate_with_retry(prompt)
                answer = response.text.strip()
            except Exception as e:
                import traceback
                error_str = str(e)
                
                # Log detailed error information
                print(f"[ERROR] AI generation failed: {error_str}")
                print(f"[ERROR] Full traceback:")
                print(traceback.format_exc())
                
                # Identify specific error types for better debugging
                if "429" in error_str:
                    print(f"[ERROR] Rate limit exceeded. API key may be out of quota.")
                elif "403" in error_str or "API_KEY_INVALID" in error_str:
                    print(f"[ERROR] Invalid API key. Check GEMINI_API_KEY in .env file.")
                elif "SAFETY" in error_str.upper():
                    print(f"[ERROR] Content blocked by safety filters.")
                else:
                    print(f"[ERROR] Unknown error type: {error_str[:200]}")
                
                answer = None
        
        # If AI not available or failed, create a simple summarized fallback
        if not answer:
            # Parse the retrieved context to create a simple answer
            contract_clauses = context.get('contract_context', '')
            law_info = context.get('law_context', '')
            risky_info = context.get('risky_clauses_summary', '')
            
            # Create a simple, direct answer based on what was found
            answer_parts = []
            
            # Start with an apology
            answer_parts.append("I apologize, but I'm having trouble generating a detailed response right now.")
            answer_parts.append("")
            
            # Provide a simple summary based on retrieved context
            if contract_clauses and contract_clauses != "No relevant contract clauses found.":
                answer_parts.append(f"Based on your question \"{request.question}\", here's what I found:")
                answer_parts.append("")
                # Extract just the first clause as a simple answer (not all raw text)
                first_clause = contract_clauses.split('\n\n')[0] if '\n\n' in contract_clauses else contract_clauses[:300]
                answer_parts.append(first_clause.replace('Clause 1: ', '').strip())
            else:
                answer_parts.append(f"I couldn't find specific information about \"{request.question}\" in your contract.")
            
            answer_parts.append("")
            answer_parts.append("Please note: This is not legal advice. Consult a qualified lawyer for legal matters.")
            
            answer = "\n".join(answer_parts)

        
        # Return response
        return {
            "success": True,
            "question": request.question,
            "answer": answer,
            "context_used": {
                "law_sections_retrieved": context['law_context'][:200] + "..." if len(context['law_context']) > 200 else context['law_context'],
                "contract_clauses_retrieved": context['contract_context'][:200] + "..." if len(context['contract_context']) > 200 else context['contract_context'],
                "risky_clauses_summary": context['risky_clauses_summary']
            },
            "disclaimer": "This is not legal advice. This tool provides educational information only. Consult a qualified lawyer for legal matters.",
            "ai_enabled": AI_MODEL is not None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing question: {str(e)}"
        )


# ===== SALARY ANALYSIS ENDPOINT =====

from salary_analysis_agent import get_salary_analysis_agent

@app.post("/salary/analyze")
async def analyze_salary_annexure(file: UploadFile = File(...)):
    """
    Analyze salary annexure and provide:
    1. Salary breakdown (CTC, PF, deductions, in-hand)
    2. Comparison with industry standards
    3. 7 auto-answers to key questions
    4. RAG-enabled Q&A
    
    Args:
        file: Salary annexure (PDF or DOCX)
        
    Returns:
        JSON with analysis, comparison stats, and 7 answers
    """
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text based on file type
        filename = file.filename.lower()
        
        if filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_content)
        elif filename.endswith('.docx'):
            text = extract_text_from_docx(file_content)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload PDF or DOCX only."
            )
        
        # Sanitize text
        text = sanitize_text(text)
        
        if not text or len(text) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from file or file is too short."
            )
        
        # Analyze salary
        salary_agent = get_salary_analysis_agent()
        
        # Use Key Manager for robust AI fallback
        ai_brain = get_key_manager() if get_key_manager() else AI_MODEL
        analysis_result = salary_agent.analyze_salary_document(text, ai_model=ai_brain)
        
        # Store for RAG Q&A
        rag_agent = get_rag_agent()
        # Create a simple context for RAG
        salary_clauses = [
            f"CTC: ₹{analysis_result['salary_breakdown']['ctc_annual']:,.0f} per year",
            f"In-hand: ₹{analysis_result['salary_breakdown']['in_hand_monthly']:,.0f} per month",
            f"PF Employee: ₹{analysis_result['salary_breakdown']['pf_employee']:,.0f}",
            f"PF Employer: ₹{analysis_result['salary_breakdown']['pf_employer']:,.0f}",
        ]
        
        rag_agent.set_contract_context(
            contract_text=text,
            clauses=salary_clauses,
            risky_clauses=[]  # No risky clauses for salary analysis
        )
        
        # Return results
        return {
            "success": True,
            "filename": file.filename,
            "analysis": analysis_result,
            "rag_enabled": True,
            "disclaimer": "This analysis is for informational purposes only. Consult with HR or a financial advisor for personalized advice."
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Salary analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing salary document: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    # Safe startup with port check
    PORT = int(os.environ.get("PORT", 8000))
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # Check if port is in use (only if running locally)
    if os.environ.get("RENDER") is None:
        result = sock.connect_ex(('127.0.0.1', PORT))
    else:
        result = 1 # Force proceed on Render
    sock.close()
    
    if result == 0:
        print(f"[WARN] Port {PORT} is in use. Attempting to force release or please restart manually.")
        # We can't easily force release in python script safely without risk, 
        # but we can warn. Uvicorn might try to bind and fail.
        # Let's try to proceed, uvicorn will raise error if it fails, which we can catch?
        # Actually uvicorn.run blocks.
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=PORT)
    except SystemExit:
        pass
    except Exception as e:
        print(f"[ERROR] Server failed to start: {e}")
