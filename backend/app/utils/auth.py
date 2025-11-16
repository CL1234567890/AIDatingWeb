"""
Authentication utilities for JWT verification
Uses Firebase Admin SDK to verify tokens from frontend
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials, firestore
import os
from typing import Optional

# Security scheme for FastAPI
security = HTTPBearer()

# Firebase Admin initialization flag
_firebase_initialized = False

def initialize_firebase():
    """
    Initialize Firebase Admin SDK
    Call this once at app startup
    """
    global _firebase_initialized
    
    if _firebase_initialized:
        return
    
    try:
        # Path to service account key
        service_account_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'firebase-service-account.json'
        )
        
        if not os.path.exists(service_account_path):
            print("⚠️  WARNING: Firebase service account key not found!")
            print(f"   Expected at: {service_account_path}")
            print("   Please follow FIREBASE_ADMIN_SETUP.md instructions")
            return
        
        # Initialize Firebase Admin
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        
        _firebase_initialized = True
        print("✅ Firebase Admin SDK initialized successfully")
        
    except Exception as e:
        print(f"❌ Failed to initialize Firebase Admin SDK: {str(e)}")
        print("   Please check your firebase-service-account.json file")


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify JWT token and return user information
    This is a FastAPI dependency that can be used to protect routes
    
    Usage:
        @app.get("/protected-route")
        async def protected_route(user: dict = Depends(get_current_user)):
            # user['uid'] contains the Firebase user ID
            # user['email'] contains the user's email
            return {"message": f"Hello {user['email']}"}
    
    Args:
        credentials: HTTP Authorization header with Bearer token
    
    Returns:
        dict: User information from decoded token
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    if not _firebase_initialized:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase Admin SDK not initialized. Please check server configuration."
        )
    
    token = credentials.credentials
    
    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(token)
        
        # Extract user information
        user_info = {
            'uid': decoded_token['uid'],
            'email': decoded_token.get('email'),
            'email_verified': decoded_token.get('email_verified', False),
            'name': decoded_token.get('name'),
            'picture': decoded_token.get('picture'),
        }
        
        return user_info
        
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    """
    Optional authentication - returns user if token is provided and valid, None otherwise
    Useful for routes that work with or without authentication
    
    Args:
        credentials: HTTP Authorization header with Bearer token (optional)
    
    Returns:
        dict or None: User information if authenticated, None otherwise
    """
    if credentials is None:
        return None
    
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None


def get_firestore_client():
    """
    Get Firestore client for database operations
    
    Returns:
        firestore.Client: Firestore client instance
        
    Raises:
        Exception: If Firebase Admin is not initialized
    """
    if not _firebase_initialized:
        raise Exception("Firebase Admin SDK not initialized")
    
    return firestore.client()


# Example usage in routes:
"""
from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    # This route is protected - requires valid JWT token
    return {
        "uid": user['uid'],
        "email": user['email']
    }

@router.post("/matches/suggestions")
async def get_match_suggestions(user: dict = Depends(get_current_user)):
    # Protected route - user must be authenticated
    user_id = user['uid']
    # ... matching logic here
    return {"matches": [...]}
"""
