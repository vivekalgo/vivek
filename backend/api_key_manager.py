"""
Fault-Tolerant Gemini API Key Manager with Automatic Rotation

Features:
- Automatic failover on quota exhaustion
- Transparent to end users
- Detailed logging
- Thread-safe for concurrent requests
- Easy to add new API keys
"""

import google.generativeai as genai
import threading
from typing import List, Optional
import time


class GeminiAPIKeyManager:
    """
    Manages multiple Gemini API keys with automatic rotation on quota exhaustion.
    """
    
    def __init__(self, api_keys: List[str]):
        """
        Initialize the API key manager.
        
        Args:
            api_keys: List of Gemini API keys to rotate through
        """
        # Filter out None/empty keys
        self.api_keys = [key for key in api_keys if key and key.strip()]
        
        if not self.api_keys:
            raise ValueError("At least one valid API key must be provided")
        
        self.current_index = 0
        self.lock = threading.Lock()  # Thread-safe key rotation
        
        print(f"[INFO] API Key Manager initialized with {len(self.api_keys)} keys")
    
    def _is_quota_error(self, error: Exception) -> bool:
        """
        Check if error is related to quota/rate limits.
        
        Args:
            error: Exception from API call
            
        Returns:
            True if quota-related error, False otherwise
        """
        error_str = str(error).lower()
        quota_indicators = [
            "429",
            "resource_exhausted",
            "quota",
            "rate limit",
            "too many requests"
        ]
        return any(indicator in error_str for indicator in quota_indicators)
    
    def _get_next_key_index(self) -> Optional[int]:
        """
        Get the next available key index in a thread-safe manner.
        
        Returns:
            Next key index, or None if all keys exhausted
        """
        with self.lock:
            start_index = self.current_index
            
            # Try each key once
            for attempt in range(len(self.api_keys)):
                index = (start_index + attempt) % len(self.api_keys)
                self.current_index = (index + 1) % len(self.api_keys)
                return index
            
            return None
    
    def generate_with_rotation(
        self, 
        prompt: str, 
        model_name: str = 'gemini-flash-latest',
        max_attempts: Optional[int] = None
    ) -> Optional[any]:
        """
        Generate content with automatic API key rotation on quota errors.
        
        Args:
            prompt: The prompt to send to Gemini
            model_name: Gemini model to use
            max_attempts: Max keys to try (default: all keys)
            
        Returns:
            Gemini response object, or None if all keys failed
        """
        if max_attempts is None:
            max_attempts = len(self.api_keys)
        
        last_error = None
        
        for attempt in range(min(max_attempts, len(self.api_keys))):
            key_index = self._get_next_key_index()
            
            if key_index is None:
                print("[ERROR] No more API keys available to try")
                break
            
            api_key = self.api_keys[key_index]
            key_preview = f"{api_key[:20]}..." if len(api_key) > 20 else api_key
            
            try:
                print(f"[INFO] Attempting with API key #{key_index + 1}: {key_preview}")
                
                # Configure and try this key
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(model_name)
                
                response = model.generate_content(prompt)
                
                print(f"[SUCCESS] API key #{key_index + 1} succeeded")
                return response
                
            except Exception as e:
                last_error = e
                error_str = str(e)
                
                # Check if it's a quota error
                if self._is_quota_error(e):
                    print(f"[WARN] API key #{key_index + 1} quota exhausted: {error_str[:100]}")
                    print(f"[INFO] Rotating to next API key...")
                    
                    # Small delay before trying next key
                    time.sleep(0.5)
                    continue
                else:
                    # Non-quota error - log and re-raise
                    print(f"[ERROR] API key #{key_index + 1} failed with non-quota error: {error_str[:200]}")
                    raise e
        
        # All keys exhausted
        print(f"[ERROR] All {len(self.api_keys)} API keys exhausted or failed")
        if last_error:
            print(f"[ERROR] Last error: {str(last_error)[:200]}")
        
        return None
    
    def add_api_key(self, api_key: str):
        """
        Add a new API key to the rotation pool.
        
        Args:
            api_key: New Gemini API key to add
        """
        if api_key and api_key.strip():
            with self.lock:
                self.api_keys.append(api_key)
                print(f"[INFO] Added new API key. Total keys: {len(self.api_keys)}")
    
    def get_status(self) -> dict:
        """
        Get current status of the key manager.
        
        Returns:
            Dictionary with manager status
        """
        return {
            "total_keys": len(self.api_keys),
            "current_index": self.current_index,
            "keys_preview": [f"{key[:20]}..." for key in self.api_keys]
        }


# Global instance (will be initialized in main.py)
_key_manager_instance = None


def get_key_manager() -> Optional[GeminiAPIKeyManager]:
    """Get the global API key manager instance."""
    return _key_manager_instance


def initialize_key_manager(api_keys: List[str]) -> GeminiAPIKeyManager:
    """
    Initialize the global API key manager.
    
    Args:
        api_keys: List of API keys
        
    Returns:
        Initialized key manager
    """
    global _key_manager_instance
    _key_manager_instance = GeminiAPIKeyManager(api_keys)
    return _key_manager_instance
