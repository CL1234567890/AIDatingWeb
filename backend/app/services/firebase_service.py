"""
Firebase Service
Handles all Firestore database operations
"""
from firebase_admin import firestore
from typing import Optional, Dict, List
from app.utils.auth import get_firestore_client


class FirebaseService:
    """Service for interacting with Firebase Firestore"""
    
    def __init__(self):
        """Initialize Firestore client"""
        self.db = get_firestore_client()
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """
        Get user profile from Firestore
        
        Args:
            user_id: Firebase UID of the user
            
        Returns:
            Dict with user profile data or None if not found
        """
        try:
            user_ref = self.db.collection('profiles').document(user_id)
            user_doc = user_ref.get()
            
            if not user_doc.exists:
                return None
            
            return user_doc.to_dict()
            
        except Exception as e:
            print(f"Error fetching user profile {user_id}: {str(e)}")
            return None
    
    async def get_multiple_users(self, user_ids: List[str]) -> Dict[str, Dict]:
        """
        Get multiple user profiles at once
        
        Args:
            user_ids: List of Firebase UIDs
            
        Returns:
            Dict mapping user_id -> profile data
        """
        results = {}
        
        for user_id in user_ids:
            profile = await self.get_user_profile(user_id)
            if profile:
                results[user_id] = profile
        
        return results
    
    async def get_all_users(self, exclude_user_id: Optional[str] = None) -> List[Dict]:
        """
        Get all users from Firestore (useful for matching)
        
        Args:
            exclude_user_id: User ID to exclude from results (typically current user)
            
        Returns:
            List of user profiles
        """
        try:
            users_ref = self.db.collection('profiles')
            
            all_users = []
            for doc in users_ref.stream():
                user_data = doc.to_dict()
                user_data['uid'] = doc.id
                
                # Exclude specified user if provided
                if exclude_user_id and doc.id == exclude_user_id:
                    continue
                    
                all_users.append(user_data)
            
            return all_users
            
        except Exception as e:
            print(f"Error fetching all users: {str(e)}")
            return []


# Singleton instance
_firebase_service = None

def get_firebase_service() -> FirebaseService:
    """Get or create FirebaseService singleton"""
    global _firebase_service
    if _firebase_service is None:
        _firebase_service = FirebaseService()
    return _firebase_service
