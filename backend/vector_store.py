"""
Simple Law Store - NO DEPENDENCIES VERSION
Uses simple keyword matching instead of vector database
Perfect for hackathon demo when dependencies won't install
"""

import os
from typing import List, Dict

class SimpleLawStore:
    """
    Simple keyword-based law retrieval.
    No vector database, no embeddings, no complex dependencies!
    """
    
    def __init__(self):
        """Initialize simple law store."""
        print("[INIT] Initializing Simple Law Store (No Vector DB)...")
        self.law_sections = []
        self.contract_clauses = []  # NEW: Store contract/NDA clauses
        self.loaded = False
    
    def load_law_sections(self, law_file_path: str):
        """
        Load Indian Contract Act sections from text file.
        
        Args:
            law_file_path: Path to indian_contract_act.txt
        """
        print(f"[LOAD] Loading law sections from: {law_file_path}")
        
        if self.loaded:
            print(f"[INFO]  Laws already loaded ({len(self.law_sections)} sections)")
            return
        
        # Read the law file with encoding detection
        if not os.path.exists(law_file_path):
            print(f"[WARN]  Warning: {law_file_path} not found. Law store will be empty.")
            return
        
        # Try multiple encodings (Windows often uses UTF-16)
        content = None
        encodings = ['utf-8', 'utf-16', 'utf-16-le', 'cp1252', 'latin-1']
        
        for encoding in encodings:
            try:
                with open(law_file_path, 'r', encoding=encoding) as f:
                    content = f.read()
                print(f"[OK] Successfully read file with {encoding} encoding")
                break
            except (UnicodeDecodeError, UnicodeError):
                continue
            except Exception as e:
                print(f"[WARN]  Error reading with {encoding}: {e}")
                continue
        
        if content is None:
            print(f"[ERROR] Could not read {law_file_path} with any encoding. Law store will be empty.")
            return
        
        # Split by section markers
        sections = content.split("=" * 80)
        
        # Process each section
        for i, section in enumerate(sections):
            section = section.strip()
            
            # Skip empty sections or header/footer
            if not section or len(section) < 50:
                continue
            
            # Extract section number if present
            section_lines = section.split('\n')
            section_title = section_lines[0].strip() if section_lines else f"Section {i}"
            
            # Store the section
            self.law_sections.append({
                'text': section,
                'title': section_title,
                'index': i,
                'source': 'Indian Contract Act'
            })
        
        self.loaded = True
        print(f"[OK] Successfully loaded {len(self.law_sections)} law sections")

    def load_contract_knowledge_base(self, nda_file_path: str, contract_file_path: str = None):
        """
        Load NDA clauses and contract-related knowledge from files.
        
        Args:
            nda_file_path: Path to nda_clauses_explanations.txt
            contract_file_path: Optional path to additional contract file
        """
        print(f"[LOG] Loading contract knowledge base...")
        
        files_to_load = [(nda_file_path, 'NDA Clauses')]
        if contract_file_path:
            files_to_load.append((contract_file_path, 'Contract Reference'))
        
        for file_path, source_name in files_to_load:
            if not os.path.exists(file_path):
                print(f"[WARN]  {source_name} file not found: {file_path}")
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Split by page markers
                pages = content.split("========== PAGE")
                
                for page_num, page_content in enumerate(pages, 1):
                    page_content = page_content.strip()
                    
                    if len(page_content) < 50:
                        continue
                    
                    # Try to extract a title from the first few lines
                    lines = page_content.split('\n')
                    title = lines[0].strip() if lines else f"{source_name} - Page {page_num}"
                    
                    # Store the clause
                    self.contract_clauses.append({
                        'text': page_content,
                        'title': title,
                        'source': source_name,
                        'page': page_num
                    })
                
                print(f"[OK] Loaded {len([c for c in self.contract_clauses if c['source'] == source_name])} clauses from {source_name}")
            
            except Exception as e:
                print(f"[ERROR] Error loading {source_name}: {e}")
        
        print(f"[STATS] Total contract clauses loaded: {len(self.contract_clauses)}")
    
    def query_relevant_laws(self, question: str, top_k: int = 3) -> List[Dict]:
        """
        Retrieve relevant law sections using simple keyword matching.
        
        Args:
            question: User's question
            top_k: Number of relevant sections to retrieve
            
        Returns:
            List of dictionaries with 'text' and 'metadata'
        """
        if not self.law_sections and not self.contract_clauses:
            print("[WARN]  No knowledge base loaded. Cannot retrieve.")
            return []
        
        # Extract keywords from question
        question_lower = question.lower()
        
        # Define keyword mappings to sections
        keyword_map = {
            'non-compete': ['section 27', 'restraint of trade'],
            'non compete': ['section 27', 'restraint of trade'],
            'noncompete': ['section 27', 'restraint of trade'],
            'restraint': ['section 27'],
            'penalty': ['section 74', 'compensation'],
            'liquidated damages': ['section 74'],
            'forfeit': ['section 74'],
            'liability': ['section 23', 'unlawful'],
            'indemnify': ['section 23'],
            'breach': ['section 73', 'compensation'],
            'damages': ['section 73', 'section 74'],
            'compensation': ['section 73', 'section 74'],
            'valid': ['section 10'],
            'contract': ['section 10'],
            'agreement': ['section 10'],
            'consent': ['section 19', 'section 16'],
            'coercion': ['section 19'],
            'fraud': ['section 19'],
            'undue influence': ['section 16'],
            'void': ['section 23', 'section 27', 'section 65'],
            'confidential': ['nda', 'confidentiality'],
            'nda': ['non-disclosure', 'confidential'],
            'secret': ['confidential', 'proprietary'],
            'disclos': ['nda', 'confidential']
        }
        
        # Score each section and contract clause
        scored_items = []
        
        # Score law sections
        for section in self.law_sections:
            score = 0
            section_text_lower = section['text'].lower()
            section_title_lower = section['title'].lower()
            
            # Check for direct keyword matches
            for keyword, related_terms in keyword_map.items():
                if keyword in question_lower:
                    for term in related_terms:
                        if term in section_title_lower or term in section_text_lower:
                            score += 10
            
            # Check for word overlap
            question_words = set(question_lower.split())
            section_words = set(section_text_lower.split())
            overlap = len(question_words & section_words)
            score += overlap
            
            if score > 0:
                scored_items.append((score, section, 'law'))
        
        # Score contract clauses
        for clause in self.contract_clauses:
            score = 0
            clause_text_lower = clause['text'].lower()
            clause_title_lower = clause['title'].lower()
            
            # Check for keyword matches
            for keyword, related_terms in keyword_map.items():
                if keyword in question_lower:
                    for term in related_terms:
                        if term in clause_title_lower or term in clause_text_lower:
                            score += 10
            
            # Check for word overlap
            question_words = set(question_lower.split())
            clause_words = set(clause_text_lower.split())
            overlap = len(question_words & clause_words)
            score += overlap * 2  # Boost contract clauses relevance
            
            if score > 0:
                scored_items.append((score, clause, 'contract'))
        
        # Sort by score and return top_k
        scored_items.sort(reverse=True, key=lambda x: x[0])
        
        relevant_items = []
        for score, item, item_type in scored_items[:top_k]:
            if item_type == 'law':
                relevant_items.append({
                    'text': item['text'],
                    'metadata': {
                        'section_title': item['title'],
                        'section_index': item.get('index', 0),
                        'source': 'Indian Contract Act'
                    },
                    'distance': 1.0 / (score + 1)
                })
            else:  # contract
                relevant_items.append({
                    'text': item['text'],
                    'metadata': {
                        'section_title': item['title'],
                        'source': item['source'],
                        'page': item.get('page', 0)
                    },
                    'distance': 1.0 / (score + 1)
                })
        
        print(f"[SEARCH] Retrieved {len(relevant_items)} relevant items (keyword matching)")
        return relevant_items
    
    def get_stats(self) -> Dict:
        """Get statistics about the law store."""
        return {
            "total_law_sections": len(self.law_sections),
            "total_contract_clauses": len(self.contract_clauses),
            "total_knowledge_items": len(self.law_sections) + len(self.contract_clauses),
            "method": "keyword_matching"
        }


# Global instance
law_store = None

def initialize_vector_store(law_file_path: str = "./laws/indian_contract_act.txt", 
                            nda_file_path: str = "./laws/nda_clauses_explanations.txt",
                            contract_file_path: str = None):
    """
    Initialize the global law store instance.
    
    Args:
        law_file_path: Path to the Indian Contract Act text file
        nda_file_path: Path to NDA clauses explanations file
        contract_file_path: Optional path to additional contract reference file
    """
    global law_store
    
    if law_store is None:
        law_store = SimpleLawStore()
        law_store.load_law_sections(law_file_path)
        law_store.load_contract_knowledge_base(nda_file_path, contract_file_path)
        stats = law_store.get_stats()
        print(f"[STATS] Law Store Stats: {stats}")
    
    return law_store

def get_vector_store():
    """Get the global law store instance."""
    if law_store is None:
        raise RuntimeError("Law store not initialized. Call initialize_vector_store() first.")
    return law_store
