"""
RAG Agent for Contract Q&A
Enhanced with Vector Embeddings for semantic search
Retrieves relevant context from contract + Indian Contract Act using vector similarity
"""

import re
from typing import Dict, List, Optional
from vector_store import get_vector_store
try:
    from vector_store_embeddings import get_vector_store as get_vector_store_embeddings
    HAS_VECTOR_STORE = True
except:
    HAS_VECTOR_STORE = False
    print("[WARN]  Vector store embeddings not available, using keyword matching fallback")

class ContractRAGAgent:
    """
    RAG Agent that combines contract context with Indian Contract Act knowledge.
    Provides grounded answers without hallucination.
    """
    
    def __init__(self):
        """Initialize RAG agent."""
        # In-memory storage for current contract session
        self.current_contract_text = None
        self.current_clauses = []
        self.current_risky_clauses = []
    
    def set_contract_context(self, contract_text: str, clauses: List[str], risky_clauses: List[Dict]):
        """
        Store contract context in memory for the current session.
        
        Args:
            contract_text: Full text of uploaded contract
            clauses: List of all clauses
            risky_clauses: List of detected risky clauses with details
        """
        self.current_contract_text = contract_text
        self.current_clauses = clauses
        self.current_risky_clauses = risky_clauses
        print(f"[INFO] Contract context loaded: {len(clauses)} clauses, {len(risky_clauses)} risky")
    
    def clear_contract_context(self):
        """Clear contract context (privacy-first)."""
        self.current_contract_text = None
        self.current_clauses = []
        self.current_risky_clauses = []
        print("[INFO]  Contract context cleared")
    
    def has_contract(self) -> bool:
        """Check if a contract is currently loaded."""
        return self.current_contract_text is not None
    
    def retrieve_contract_clauses_semantic(self, question: str, top_k: int = 3) -> List[str]:
        """
        Retrieve contract clauses using semantic vector similarity.
        
        Args:
            question: User's question
            top_k: Number of clauses to return
            
        Returns:
            List of relevant clause texts
        """
        if not HAS_VECTOR_STORE or not self.current_clauses:
            # Fallback to keyword matching
            return self.retrieve_relevant_contract_clauses(question, top_k)
        
        try:
            vs = get_vector_store_embeddings()
            # Add current contract clauses to vector store
            vs.add_contract_clauses(self.current_clauses)
            
            # Search using semantic similarity
            results = vs.search_contract_clauses(question, top_k)
            
            if results:
                print(f"[INFO] Retrieved {len(results)} clauses using semantic search")
                return results
            else:
                # Fallback to keyword matching
                return self.retrieve_relevant_contract_clauses(question, top_k)
        except Exception as e:
            print(f"[WARN]  Semantic search error: {e}, falling back to keyword matching")
            return self.retrieve_relevant_contract_clauses(question, top_k)
    
    def retrieve_laws_semantic(self, question: str, top_k: int = 3) -> List[Dict]:
        """
        Retrieve Indian Contract Act sections using semantic similarity.
        
        Args:
            question: User's question
            top_k: Number of sections to return
            
        Returns:
            List of relevant law sections
        """
        if not HAS_VECTOR_STORE:
            # Fallback to keyword matching
            vector_store = get_vector_store()
            return vector_store.query_relevant_laws(question, top_k)
        
        try:
            vs = get_vector_store_embeddings()
            results = vs.search_laws(question, top_k)
            
            if results:
                print(f"[INFO] Retrieved {len(results)} laws using semantic search")
                return results
            else:
                # Fallback
                vector_store = get_vector_store()
                return vector_store.query_relevant_laws(question, top_k)
        except Exception as e:
            print(f"[WARN]  Law semantic search error: {e}, falling back")
            vector_store = get_vector_store()
            return vector_store.query_relevant_laws(question, top_k)
    
    def retrieve_nda_semantic(self, question: str, top_k: int = 2) -> str:
        """
        Retrieve NDA clauses using semantic similarity.
        
        Args:
            question: User's question
            top_k: Number of items to return
            
        Returns:
            Formatted string with relevant NDA information
        """
        if not HAS_VECTOR_STORE:
            # Fallback to keyword matching
            return self.retrieve_knowledge_base_items(question, top_k)
        
        try:
            vs = get_vector_store_embeddings()
            results = vs.search_nda_clauses(question, top_k)
            
            if results:
                print(f"[LOG] Retrieved {len(results)} NDA clauses using semantic search")
                return "\n".join([f"[NDA Clause]\n{text}\n" for text in results])
            else:
                # Fallback
                return self.retrieve_knowledge_base_items(question, top_k)
        except Exception as e:
            print(f"[WARN]  NDA semantic search error: {e}, falling back")
            return self.retrieve_knowledge_base_items(question, top_k)

    def retrieve_relevant_contract_clauses(self, question: str, top_k: int = 3) -> List[str]:
        """
        Retrieve contract clauses relevant to the question using improved matching.
        
        Args:
            question: User's question
            top_k: Number of clauses to return
            
        Returns:
            List of relevant clause texts
        """
        if not self.current_clauses:
            return []
        
        question_lower = question.lower()
        
        # Enhanced keyword mappings for better matching
        keyword_map = {
            'confidential': ['confidential', 'secret', 'privacy', 'disclosure', 'nda', 'confidentiality'],
            'non-compete': ['compete', 'competitor', 'restraint', 'work with', 'non-compete', 'noncompete', 'competing'],
            'payment': ['payment', 'salary', 'wage', 'compensation', 'fee', 'amount', 'money', 'due', 'paid', 'pay'],
            'paid': ['payment', 'salary', 'wage', 'compensation', 'fee', 'amount', 'money', 'due', 'paid', 'pay'],
            'terminate': ['terminate', 'termination', 'end', 'cancel', 'notice', 'exit'],
            'termination': ['terminate', 'termination', 'end', 'cancel', 'notice', 'exit', 'leave'],
            'penalty': ['penalty', 'fine', 'loss', 'damage', 'breach', 'rupees', 'rs', 'compensation'],
            'working': ['work', 'work with', 'employee', 'freelancer', 'compete', 'competitor', 'engage'],
            'clause': ['clause', 'agreement', 'contract', 'term', 'section'],
            'risk': ['risk', 'risky', 'dangerous', 'problem', 'issue', 'careful', 'careful attention', 'non-compete', 'restraint'],
            'risky': ['risk', 'risky', 'dangerous', 'problem', 'issue', 'careful', 'careful attention', 'non-compete', 'restraint'],
            'liability': ['liable', 'liability', 'responsible', 'indemnify', 'breach'],
            'duration': ['duration', 'period', 'time', 'months', 'years', 'how long'],
            'obligations': ['obligation', 'must', 'required', 'shall', 'should'],
            'end': ['terminate', 'termination', 'end', 'cancel', 'notice', 'exit'],
        }
        
        # Score each clause
        scored_clauses = []
        for clause in self.current_clauses:
            clause_lower = clause.lower()
            score = 0
            
            # Direct keyword matching - much higher weight
            for keyword, related_terms in keyword_map.items():
                if keyword in question_lower:
                    for term in related_terms:
                        if term in clause_lower:
                            score += 20  # High weight for direct matches
            
            # Word overlap matching - lower weight
            if score == 0:  # Only if no direct match
                question_words = set(question_lower.split())
                clause_words = set(clause_lower.split())
                overlap = len(question_words & clause_words)
                score = overlap * 2
            
            if score > 0:
                scored_clauses.append((score, clause))
        
        # Sort by score (descending) and return top_k
        scored_clauses.sort(reverse=True, key=lambda x: x[0])
        relevant_clauses = [clause for score, clause in scored_clauses[:top_k]]
        
        print(f"[LOG] Retrieved {len(relevant_clauses)} relevant contract clauses (score-based matching)")
        return relevant_clauses
    
    def retrieve_knowledge_base_items(self, question: str, top_k: int = 2) -> str:
        """
        Retrieve relevant items from the knowledge base (NDA clauses, contract principles).
        
        Args:
            question: User's question
            top_k: Number of items to return
            
        Returns:
            Formatted string with relevant knowledge
        """
        vector_store = get_vector_store()
        relevant_items = vector_store.query_relevant_laws(question, top_k=top_k)
        
        if not relevant_items:
            return ""
        
        formatted = []
        for i, item in enumerate(relevant_items, 1):
            source = item.get('metadata', {}).get('source', 'Unknown')
            title = item.get('metadata', {}).get('section_title', f'Item {i}')
            text = item.get('text', '')[:500]  # Limit to 500 chars
            
            formatted.append(f"[{source} - {title}]\n{text}\n")
        
        return "\n".join(formatted)
    
    def retrieve_context(self, question: str) -> Dict:
        """
        Retrieve all relevant context for answering a question.
        Uses hybrid approach: semantic vector search + keyword matching fallback
        
        Args:
            question: User's question
            
        Returns:
            Dictionary with law_context, contract_context, knowledge_context, and risky_clauses
        """
        # 1. Retrieve relevant items from knowledge base (NDA clauses, contract principles)
        # Using semantic search if available
        knowledge_context = self.retrieve_nda_semantic(question, top_k=2)
        if not knowledge_context:
            knowledge_context = self.retrieve_knowledge_base_items(question, top_k=2)
        
        # 2. Retrieve relevant Indian Contract Act sections using semantic search
        relevant_laws = self.retrieve_laws_semantic(question, top_k=3)
        # Convert to dict format if needed (semantic search might return different format)
        if relevant_laws and isinstance(relevant_laws[0], str):
            # Convert string results to dict format
            relevant_laws = [{'text': law, 'metadata': {'section_title': f'Retrieved Section'}} for law in relevant_laws]
        
        # 3. Retrieve relevant contract clauses using semantic search (preferred)
        if self.current_clauses:
            relevant_clauses = self.retrieve_contract_clauses_semantic(question, top_k=3)
        else:
            relevant_clauses = []
        
        # 4. Check if question is about risks - if so, format retrieved clauses as risky
        question_lower = question.lower()
        is_risk_question = any(word in question_lower for word in ['risk', 'risky', 'dangerous', 'problem', 'issue'])
        
        # If risk question and we found clauses, format them with risk labels
        risky_clause_summary = self._format_risky_clauses()
        if is_risk_question and relevant_clauses and risky_clause_summary == "No risky clauses detected in this contract.":
            # Format retrieved clauses as risky clauses since user asked about risks
            risky_clause_summary = f"Potential risky clauses found:\n\n"
            for i, clause in enumerate(relevant_clauses, 1):
                clause_type = "General Clause"
                risk_level = "Medium"
                
                # Detect clause type and risk level
                clause_lower = clause.lower()
                if 'non-compete' in clause_lower or 'compete' in clause_lower:
                    clause_type = "Non-Compete / Restraint of Trade"
                    risk_level = "High"
                elif 'confidential' in clause_lower:
                    clause_type = "Confidentiality"
                    risk_level = "Medium"
                elif 'liability' in clause_lower or 'indemnif' in clause_lower:
                    clause_type = "Liability"
                    risk_level = "High"
                elif 'termination' in clause_lower or 'penalty' in clause_lower:
                    clause_type = "Termination/Penalty"
                    risk_level = "Medium"
                
                risky_clause_summary += f"--- RISKY CLAUSE {i} ---\n"
                risky_clause_summary += f"Type: {clause_type}\n"
                risky_clause_summary += f"Risk Level: {risk_level}\n"
                risky_clause_summary += f"Clause Text: \"{clause[:150]}...\"\n\n"
        
        # 5. Format context
        context = {
            "knowledge_context": knowledge_context if knowledge_context else "No specific knowledge base items found for this question.",
            "law_context": self._format_law_context(relevant_laws),
            "contract_context": self._format_contract_context(relevant_clauses),
            "risky_clauses_summary": risky_clause_summary,
            "has_contract": self.has_contract()
        }
        
        return context
    
    def _clean_text(self, text: str) -> str:
        """
        Universal text sanitization to prevent Unicode crashes on Windows.
        Removes emojis and forces UTF-8 compliance.
        """
        if not text:
            return ""
        
        # 1. Force UTF-8 encoding/decoding
        text = text.encode("utf-8", "ignore").decode("utf-8")
        
        # 2. Remove emojis and symbols (Surrogate pairs & specific ranges)
        text = re.sub(r'[\U00010000-\U0010ffff]', '', text)
        
        # 3. Basic cleanup
        text = re.sub(r'=+', '', text)
        text = re.sub(r'-{3,}', '', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = text.strip()
        
        return text
    
    def _format_law_context(self, relevant_laws: List[Dict]) -> str:
        """Format retrieved law sections for LLM prompt."""
        if not relevant_laws:
            return "No relevant law sections found."
        
        formatted = []
        for i, law in enumerate(relevant_laws, 1):
            section_title = law.get('metadata', {}).get('section_title', f'Section {i}')
            # Clean the text
            clean_title = self._clean_text(section_title)
            clean_text = self._clean_text(law['text'])
            formatted.append(f"{clean_title}\n{clean_text}")
        
        return "\n\n".join(formatted)
    
    def _format_contract_context(self, relevant_clauses: List[str]) -> str:
        """Format retrieved contract clauses for LLM prompt."""
        if not relevant_clauses:
            return "No relevant contract clauses found."
        
        formatted = []
        for i, clause in enumerate(relevant_clauses, 1):
            # Clean the clause text
            clean_clause = self._clean_text(clause)
            formatted.append(f"Clause {i}: {clean_clause}")
        
        return "\n\n".join(formatted)
    
    def _format_risky_clauses(self) -> str:
        """Format detailed summary of risky clauses with full context."""
        if not self.current_risky_clauses:
            return "No risky clauses detected in this contract."
        
        summary = f"Found {len(self.current_risky_clauses)} risky clauses:\n\n"
        
        for i, risky in enumerate(self.current_risky_clauses, 1):
            summary += f"Risky Clause {i}:\n"
            summary += f"Type: {risky.get('clause_type', 'Unknown')}\n"
            summary += f"Risk Level: {risky.get('risk_level', 'Unknown')} ({risky.get('risk_score', 'N/A')}/10)\n"
            
            # Add explanation
            if risky.get('why_risky') or risky.get('why_risky_ai'):
                explanation = risky.get('why_risky_ai') or risky.get('why_risky')
                summary += f"Why: {explanation}\n"
            
            # Add Indian law reference
            if risky.get('applicable_law_section'):
                summary += f"Law: {risky['applicable_law_section']}\n"
            
            # Add actual clause text (cleaned)
            if risky.get('clause_text'):
                clean_clause = self._clean_text(risky['clause_text'])
                summary += f"Text: \"{clean_clause[:200]}...\"\n"
            
            summary += "\n"
        
        return summary
    
    def generate_rag_prompt(self, question: str, context: Dict) -> str:
        """
        Generate the complete RAG prompt for LLM.
        Strict ELI5 (Explain Like I'm Five) style validation with Few-Shot examples.
        """
        # SANITIZE INPUTS
        question = self._clean_text(question)
        
        # Create a strict ELI5 prompt with examples
        prompt = f"""You are a smart, friendly legal explainer. Your job is to Explain Like I'm 5 (ELI5).
You help regular people understand complex Indian contracts in simple, plain English.

---
### ❌ BAD ANSWER (DON'T DO THIS):
"Clause 4.1 states that the employee shall not engage in competitive activities. This is in accordance with Section 27 of the Indian Contract Act..."
*(Too boring! Too robot-like!)*

### ✅ GOOD ANSWER (DO THIS):
"No, you can't work for a competitor while you are employed here. This is standard in India. However, once you leave the job, they cannot stop you from joining a competitor because Indian law bans 'post-employment' restrictions. So you are free to move on!"
*(Simple! Direct! Helpful!)*

---

### CONTEXT FROM THE CONTRACT:
{context['contract_context']}

### RELEVANT INDIAN LAWS:
{context['law_context']}

### RISKY CLAUSES:
{context['risky_clauses_summary']}

---

### USER'S QUESTION: 
{question}

---

### YOUR INSTRUCTIONS:
1. **THINK FIRST**: Read the contract context and finding the specific answer to the user's question.
2. **SYNTHESIZE**: Do NOT repeat the clause. Explain what it *means* for the user in practical terms.
3. **BE BRIEF**: Give the answer in 2-3 sentences max unless complex.
4. **NO QUOTES**: Do not use quotation marks to recite the contract. Paraphrase everything.
5. **DIRECT ANSWER**: If asked "Is there a notice period?", start with "Yes, the notice period is..."

### EXAMPLE INTERACTION:
User: "Can I do freelance work?"
Bad AI: "Clause 5.2 says 'The employee shall not engage in any other business...'"
Good AI: "No, you cannot. The contract explicitly forbids you from taking up other employment or business activities while you are working here."

YOUR ANSWER (Summarized & Practical):
"""
        
        return self._clean_text(prompt)


# Global RAG agent instance
contract_rag_agent = None

def initialize_rag_agent():
    """Initialize the global RAG agent instance."""
    global contract_rag_agent
    
    if contract_rag_agent is None:
        contract_rag_agent = ContractRAGAgent()
        print("[RAG] RAG Agent initialized")
    
    return contract_rag_agent

def get_rag_agent() -> ContractRAGAgent:
    """Get the global RAG agent instance."""
    if contract_rag_agent is None:
        raise RuntimeError("RAG agent not initialized. Call initialize_rag_agent() first.")
    return contract_rag_agent
