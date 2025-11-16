"""
Profile Routes
Handles user profile operations (view, edit)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from app.utils.auth import get_current_user
from app.services.firebase_service import get_firebase_service

router = APIRouter(
    prefix="/api/profile",
    tags=["profile"]
)


class ProfileUpdateRequest(BaseModel):
    """Request model for updating user profile"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    age: Optional[int] = Field(None, ge=18, le=120)
    gender: Optional[str] = None
    sexual_orientation: Optional[str] = None
    location: Optional[str] = None
    interest_tags: Optional[str] = None
    education_level: Optional[str] = None
    income_bracket: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)


@router.get("/me")
async def get_my_profile(user: dict = Depends(get_current_user)):
    """
    Get current user's full profile
    """
    firebase_service = get_firebase_service()
    profile = await firebase_service.get_user_profile(user['uid'])
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Return full profile for current user
    return {
        "success": True,
        "profile": profile
    }


@router.put("/me")
async def update_my_profile(
    profile_data: ProfileUpdateRequest,
    user: dict = Depends(get_current_user)
):
    """
    Update current user's profile
    Only updates fields that are provided (not None)
    """
    firebase_service = get_firebase_service()
    
    # Get current profile
    current_profile = await firebase_service.get_user_profile(user['uid'])
    if not current_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Build update dict with only provided fields
    update_data = {}
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        if value is not None:
            update_data[field] = value
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields to update"
        )
    
    # Update profile in Firestore
    try:
        db = firebase_service.db
        profile_ref = db.collection('profiles').document(user['uid'])
        profile_ref.update(update_data)
        
        # Get updated profile
        updated_profile = await firebase_service.get_user_profile(user['uid'])
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "profile": updated_profile
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.get("/{user_id}")
async def get_user_profile(
    user_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Get another user's profile (public view)
    Returns limited profile information for privacy
    """
    firebase_service = get_firebase_service()
    profile = await firebase_service.get_user_profile(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    # Return only public profile information
    public_profile = {
        "uid": user_id,
        "name": profile.get("name", "User"),
        "age": profile.get("age"),
        "gender": profile.get("gender"),
        "location": profile.get("location"),
        "interest_tags": profile.get("interest_tags", ""),
        "bio": profile.get("bio", ""),
        "sexual_orientation": profile.get("sexual_orientation"),
    }
    
    return {
        "success": True,
        "profile": public_profile
    }
