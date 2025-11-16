"""
Recommendation API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
import pandas as pd

from app.utils.auth import get_current_user
from app.utils.profile import get_all_user_profiles
from app.utils.recommend import HybridRecommender

router = APIRouter(
    prefix="/api/recommendations",
    tags=["recommendations"]
)

# Response model
class MatchRecommendation(BaseModel):
    uid: str
    name: str
    gender: str
    age: int
    interest_tags: str
    similarity_score: float

class RecommendationsResponse(BaseModel):
    success: bool
    matches: List[MatchRecommendation]
    total: int

# Global recommender instance (will be reinitialized when needed)
_recommender = None
_last_profile_count = 0

def get_recommender():
    """Get or create recommender instance"""
    global _recommender, _last_profile_count
    
    # Get all profiles
    profiles = get_all_user_profiles()
    
    if not profiles:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No user profiles found in database"
        )
    
    # Reinitialize if profile count changed (new users registered)
    if _recommender is None or len(profiles) != _last_profile_count:
        print(f"Initializing recommender with {len(profiles)} profiles...")
        profiles_df = pd.DataFrame(profiles)
        _recommender = HybridRecommender(profiles_df)
        _recommender.fit()
        _last_profile_count = len(profiles)
        print("Recommender initialized successfully")
    
    return _recommender

@router.get("/matches", response_model=RecommendationsResponse)
async def get_match_recommendations(
    top_n: int = 10,
    user: dict = Depends(get_current_user)
):
    """
    Get personalized match recommendations for the current user
    
    Parameters:
    - top_n: Number of recommendations to return (default: 10, max: 50)
    
    Returns:
    - List of recommended matches with similarity scores
    """
    try:
        # Validate top_n
        if top_n < 1 or top_n > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="top_n must be between 1 and 50"
            )
        
        user_id = user['uid']
        
        # Get recommender instance
        recommender = get_recommender()
        
        # Get recommendations
        recommendations_df = recommender.recommend(user_id, top_n=top_n)
        
        if recommendations_df.empty:
            return RecommendationsResponse(
                success=True,
                matches=[],
                total=0
            )
        
        # Convert DataFrame to list of dicts
        matches = []
        for _, row in recommendations_df.iterrows():
            matches.append(MatchRecommendation(
                uid=row['uid'],
                name=row['name'],
                gender=row['gender'],
                age=int(row['age']),
                interest_tags=row['interest_tags'],
                similarity_score=float(row['similarity_score'])
            ))
        
        return RecommendationsResponse(
            success=True,
            matches=matches,
            total=len(matches)
        )
        
    except Exception as e:
        print(f"Error getting recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}"
        )

@router.post("/refresh")
async def refresh_recommender(user: dict = Depends(get_current_user)):
    """
    Force refresh the recommender model (useful after new users register)
    Admin-only endpoint in production
    """
    global _recommender, _last_profile_count
    
    try:
        profiles = get_all_user_profiles()
        
        if not profiles:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No user profiles found in database"
            )
        
        profiles_df = pd.DataFrame(profiles)
        _recommender = HybridRecommender(profiles_df)
        _recommender.fit()
        _last_profile_count = len(profiles)
        
        return {
            "success": True,
            "message": f"Recommender refreshed with {len(profiles)} profiles"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refresh recommender: {str(e)}"
        )
