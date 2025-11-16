"""
Icebreaker Generator Routes
API endpoints for AI-powered icebreaker generation
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from app.utils.auth import get_current_user
from app.services.firebase_service import get_firebase_service
from app.services.ai_service import get_ai_service


# Router instance
router = APIRouter(
    prefix="/api/icebreaker",
    tags=["icebreaker"]
)


# Request models
class IcebreakerRequest(BaseModel):
    """Request model for icebreaker generation"""
    recipient_id: str = Field(..., description="Firebase UID of the recipient user")
    count: Optional[int] = Field(1, description="Number of icebreakers to generate (1-5)", ge=1, le=5)


class IcebreakerResponse(BaseModel):
    """Response model for icebreaker generation"""
    success: bool
    icebreakers: List[str]
    sender: dict
    recipient: dict
    message: Optional[str] = None


@router.post("/generate", response_model=IcebreakerResponse)
async def generate_icebreaker(
    request: IcebreakerRequest,
    user: dict = Depends(get_current_user)
):
    """
    Generate personalized icebreaker message(s) for a match
    
    This endpoint takes the sender (authenticated user) and recipient user IDs,
    fetches their profiles from Firebase, and uses AI to generate personalized
    icebreaker messages based on their interests, bios, and common ground.
    
    **Authentication Required**: Yes (JWT token in Authorization header)
    
    **Parameters:**
    - recipient_id: Firebase UID of the person you want to message
    - count: Number of icebreaker options to generate (default: 1, max: 5)
    
    **Returns:**
    - icebreakers: List of generated icebreaker messages
    - sender: Basic info about the sender
    - recipient: Basic info about the recipient
    
    **Example Request:**
    ```json
    {
        "recipient_id": "abc123xyz",
        "count": 3
    }
    ```
    
    **Example Response:**
    ```json
    {
        "success": true,
        "icebreakers": [
            "Hey! I noticed you're into rock climbing too. Do you have a favorite spot?",
            "I saw that you love hiking! Have you checked out any trails recently?",
            "Your profile mentioned photography - what kind of shots are you into?"
        ],
        "sender": {
            "uid": "user123",
            "name": "John"
        },
        "recipient": {
            "uid": "abc123xyz",
            "name": "Jane"
        }
    }
    ```
    """
    sender_id = user['uid']
    recipient_id = request.recipient_id
    
    # Validate that sender and recipient are different
    if sender_id == recipient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate icebreaker for yourself"
        )
    
    # Get Firebase service
    firebase_service = get_firebase_service()
    
    # Fetch both user profiles
    sender_profile = await firebase_service.get_user_profile(sender_id)
    recipient_profile = await firebase_service.get_user_profile(recipient_id)
    
    # Validate profiles exist
    if not sender_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sender profile not found"
        )
    
    if not recipient_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient profile not found"
        )
    
    # Get AI service
    ai_service = get_ai_service()
    
    # Generate icebreaker(s)
    try:
        if request.count == 1:
            # Generate single icebreaker
            icebreaker = await ai_service.generate_icebreaker(
                sender_profile,
                recipient_profile
            )
            icebreakers = [icebreaker] if icebreaker else []
        else:
            # Generate multiple icebreakers
            icebreakers = await ai_service.generate_multiple_icebreakers(
                sender_profile,
                recipient_profile,
                count=request.count
            )
        
        if not icebreakers:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate icebreaker"
            )
        
        # Prepare response with basic user info
        sender_info = {
            "uid": sender_id,
            "name": sender_profile.get('profile', {}).get('name', 'Unknown'),
            "email": sender_profile.get('email')
        }
        
        recipient_info = {
            "uid": recipient_id,
            "name": recipient_profile.get('profile', {}).get('name', 'Unknown'),
            "interests": recipient_profile.get('profile', {}).get('interests', [])
        }
        
        return IcebreakerResponse(
            success=True,
            icebreakers=icebreakers,
            sender=sender_info,
            recipient=recipient_info,
            message=f"Generated {len(icebreakers)} icebreaker(s) successfully"
        )
        
    except Exception as e:
        print(f"Error in icebreaker generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate icebreaker: {str(e)}"
        )


@router.get("/test")
async def test_icebreaker_endpoint(user: dict = Depends(get_current_user)):
    """
    Test endpoint to verify icebreaker route is working
    
    **Authentication Required**: Yes
    """
    return {
        "success": True,
        "message": "Icebreaker endpoint is working!",
        "user": user['email'],
        "endpoint": "/api/icebreaker/generate"
    }
