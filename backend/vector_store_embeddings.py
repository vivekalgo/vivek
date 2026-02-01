"""
Enhanced Vector Store - Using Google Embeddings
Stores contract and law data in vector format for semantic search
"""

import os
import json
from typing import List, Dict, Tuple
import numpy as np
from datetime import datetime

try:
    import google.generativeai as genai
    HAS_GOOGLE_EMBEDDINGS = True
except:
    HAS_GOOGLE_EMBEDDINGS = False

class VectorStore:
    """
    Vector-based retrieval system using Google Embeddings.
    Stores law sections, contract clauses, and uploaded contracts as vectors.
    """
    
    def __init__(self):
        """Initialize vector store."""
        global HAS_GOOGLE_EMBEDDINGS
        print("[INFO] Initializing Vector Store with Embeddings...")
        self.law_vectors = []  # List of {text, embedding, metadata}
        self.contract_vectors = []  # Contract clauses
        self.nda_vectors = []  # NDA explanations
        self.uploaded_contract_vectors = []  # User-uploaded contract
        self.vector_dimension = 768  # Google's embedding dimension
        self.loaded = False
        
        # Initialize Google embeddings if available
        if HAS_GOOGLE_EMBEDDINGS:
            try:
                api_key = os.getenv("GEMINI_API_KEY", "")
                if api_key:
                    genai.configure(api_key=api_key)
                    self.embedding_model = "models/embedding-001"
                    print("[SUCCESS] Google Embeddings API configured")
                else:
                    HAS_GOOGLE_EMBEDDINGS = False
                    print("[WARN]  GEMINI_API_KEY not found, using keyword matching fallback")
            except Exception as e:
                HAS_GOOGLE_EMBEDDINGS = False
                print(f"[WARN]  Could not configure embeddings: {e}")
    
    def get_embedding(self, text: str) -> List[float]:
        """
        Get embedding for text using Google API.
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        if not HAS_GOOGLE_EMBEDDINGS:
            # Fallback: Simple hashing for demo
            return self._hash_based_embedding(text)
        
        try:
            result = genai.embed_content(
                model=self.embedding_model,
                content=text,
                task_type="semantic_similarity"
            )
            return result['embedding']
        except Exception as e:
            print(f"[ERROR] Embedding error: {e}, using fallback")
            return self._hash_based_embedding(text)
    
    def _hash_based_embedding(self, text: str) -> List[float]:
        """
        Simple hash-based embedding for fallback.
        Creates a deterministic vector from text hash.
        """
        import hashlib
        hash_obj = hashlib.md5(text.encode())
        hash_hex = hash_obj.hexdigest()
        
        # Convert hex to vector
        vector = []
        for i in range(0, len(hash_hex), 2):
            byte_val = int(hash_hex[i:i+2], 16)
            # Normalize to -1 to 1 range
            vector.append((byte_val / 128.0) - 1.0)
        
        # Pad to 768 dimensions
        while len(vector) < self.vector_dimension:
            vector.append(0.0)
        return vector[:self.vector_dimension]
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors.
        
        Args:
            vec1: First vector
            vec2: Second vector
            
        Returns:
            Similarity score (0-1)
        """
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(np.dot(vec1, vec2) / (norm1 * norm2))
    
    def load_law_sections(self, law_file_path: str):
        """
        Load Indian Contract Act sections and create vectors.
        
        Args:
            law_file_path: Path to indian_contract_act.txt
        """
        print(f"[INFO] Loading law sections from: {law_file_path}")
        
        if not os.path.exists(law_file_path):
            print(f"[WARN]  Warning: {law_file_path} not found")
            return
        
        # Try multiple encodings
        content = None
        encodings = ['utf-8', 'utf-16', 'utf-16-le', 'cp1252', 'latin-1']
        
        for encoding in encodings:
            try:
                with open(law_file_path, 'r', encoding=encoding) as f:
                    content = f.read()
                print(f"[SUCCESS] Successfully read file with {encoding} encoding")
                break
            except:
                continue
        
        if not content:
            print("[ERROR] Could not read law file")
            return
        
        # Split into sections (using "Section" as delimiter)
        sections = content.split('Section ')
        
        for i, section in enumerate(sections[1:], 1):  # Skip first empty split
            if len(section.strip()) > 50:
                # Extract section number and text
                lines = section.split('\n')
                section_num = lines[0].split('\n')[0]
                section_text = '\n'.join(lines[1:]).strip()[:500]  # First 500 chars
                
                embedding = self.get_embedding(section_text)
                
                self.law_vectors.append({
                    'text': section_text,
                    'embedding': embedding,
                    'metadata': {
                        'section': f"Section {section_num}",
                        'type': 'law',
                        'source': 'Indian Contract Act'
                    }
                })
        
        print(f"[SUCCESS] Loaded {len(self.law_vectors)} law sections with embeddings")
    
    def load_nda_clauses(self, nda_file_path: str):
        """
        Load NDA clauses and explanations with vectors.
        
        Args:
            nda_file_path: Path to nda_clauses_explanations.txt
        """
        print(f"[INFO] Loading NDA clauses from: {nda_file_path}")
        
        if not os.path.exists(nda_file_path):
            print(f"[WARN]  Warning: {nda_file_path} not found")
            return
        
        # Try multiple encodings
        content = None
        encodings = ['utf-8', 'utf-16', 'utf-16-le', 'cp1252', 'latin-1']
        
        for encoding in encodings:
            try:
                with open(nda_file_path, 'r', encoding=encoding) as f:
                    content = f.read()
                print(f"[SUCCESS] Successfully read NDA file with {encoding} encoding")
                break
            except:
                continue
        
        if not content:
            print("[ERROR] Could not read NDA file")
            return
        
        # Split into clauses (using numbered format)
        clauses = content.split('==========')
        
        for i, clause in enumerate(clauses):
            if len(clause.strip()) > 50:
                clause_text = clause.strip()[:500]  # First 500 chars
                
                embedding = self.get_embedding(clause_text)
                
                self.nda_vectors.append({
                    'text': clause_text,
                    'embedding': embedding,
                    'metadata': {
                        'clause_id': i,
                        'type': 'nda_clause',
                        'source': 'NDA Clauses Explanations'
                    }
                })
        
        print(f"[SUCCESS] Loaded {len(self.nda_vectors)} NDA clauses with embeddings")
    
    def add_contract_clauses(self, clauses: List[str]):
        """
        Store uploaded contract clauses as vectors.
        
        Args:
            clauses: List of contract clause texts
        """
        print(f"[INFO] Vectorizing {len(clauses)} contract clauses...")
        
        self.uploaded_contract_vectors = []
        
        for i, clause in enumerate(clauses):
            if len(clause.strip()) > 20:
                embedding = self.get_embedding(clause)
                
                self.uploaded_contract_vectors.append({
                    'text': clause,
                    'embedding': embedding,
                    'metadata': {
                        'clause_id': i,
                        'type': 'user_contract',
                        'source': 'Uploaded Contract'
                    }
                })
        
        print(f"[SUCCESS] Vectorized {len(self.uploaded_contract_vectors)} contract clauses")
    
    def search_similar(self, query: str, vector_list: List[Dict], top_k: int = 3) -> List[Tuple[str, float]]:
        """
        Search for similar items using vector similarity.
        
        Args:
            query: Search query text
            vector_list: List of vectors to search in
            top_k: Number of top results
            
        Returns:
            List of (text, similarity_score) tuples
        """
        if not vector_list:
            return []
        
        # Get query embedding
        query_embedding = self.get_embedding(query)
        
        # Calculate similarity for all items
        similarities = []
        for item in vector_list:
            sim = self.cosine_similarity(query_embedding, item['embedding'])
            similarities.append((item['text'], sim, item['metadata']))
        
        # Sort by similarity and return top_k
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return [(text, score) for text, score, _ in similarities[:top_k]]
    
    def search_contract_clauses(self, query: str, top_k: int = 3) -> List[str]:
        """
        Search uploaded contract clauses by semantic similarity.
        
        Args:
            query: Search query
            top_k: Number of results
            
        Returns:
            List of relevant clause texts
        """
        if not self.uploaded_contract_vectors:
            return []
        
        results = self.search_similar(query, self.uploaded_contract_vectors, top_k)
        return [text for text, _ in results]
    
    def search_laws(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Search law sections by semantic similarity.
        
        Args:
            query: Search query
            top_k: Number of results
            
        Returns:
            List of relevant law sections with metadata
        """
        if not self.law_vectors:
            return []
        
        results = self.search_similar(query, self.law_vectors, top_k)
        
        law_results = []
        for text, score in results:
            # Find metadata for this text
            for item in self.law_vectors:
                if item['text'] == text:
                    law_results.append({
                        'text': text,
                        'score': score,
                        'metadata': item['metadata']
                    })
                    break
        
        return law_results
    
    def search_nda_clauses(self, query: str, top_k: int = 3) -> List[str]:
        """
        Search NDA clauses by semantic similarity.
        
        Args:
            query: Search query
            top_k: Number of results
            
        Returns:
            List of relevant NDA clause texts
        """
        if not self.nda_vectors:
            return []
        
        results = self.search_similar(query, self.nda_vectors, top_k)
        return [text for text, _ in results]
    
    def get_stats(self) -> Dict:
        """Get vector store statistics."""
        return {
            'law_sections': len(self.law_vectors),
            'nda_clauses': len(self.nda_vectors),
            'uploaded_contract_clauses': len(self.uploaded_contract_vectors),
            'total_vectors': len(self.law_vectors) + len(self.nda_vectors) + len(self.uploaded_contract_vectors),
            'embedding_model': 'Google Embeddings' if HAS_GOOGLE_EMBEDDINGS else 'Hash-based (fallback)',
            'vector_dimension': self.vector_dimension
        }


# Global instance
vector_store_instance = None

def initialize_vector_store(law_file_path: str, nda_file_path: str):
    """Initialize global vector store with law and NDA data."""
    global vector_store_instance
    
    if vector_store_instance is None:
        vector_store_instance = VectorStore()
        vector_store_instance.load_law_sections(law_file_path)
        vector_store_instance.load_nda_clauses(nda_file_path)
        
        stats = vector_store_instance.get_stats()
        print(f"[INFO] Vector Store Stats: {stats}")

def get_vector_store() -> VectorStore:
    """Get global vector store instance."""
    global vector_store_instance
    if vector_store_instance is None:
        vector_store_instance = VectorStore()
    return vector_store_instance
