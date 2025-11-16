"""
FastAPI Backend for AI Dating App
Main application entry point
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Import routes
from app.routes import ai_date_plan, icebreaker, recommend

# Firebase (already provided by teammate)
from app.utils.auth import initialize_firebase, get_current_user

app = FastAPI(
    title="AI Dating App API",
    description="Backend API for AI-powered dating application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
async def startup_event():
    print("🚀 Starting AI Dating App Backend...")
    initialize_firebase()
    print("✅ Backend startup complete")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "AI Dating App API",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/api/user/profile")
async def get_user_profile(user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "uid": user["uid"],
            "email": user["email"],
            "email_verified": user.get("email_verified", False),
            "name": user.get("name")
        }
    }

@app.get("/api/user/profile/{user_id}")
async def get_user_profile_by_id(user_id: str, user: dict = Depends(get_current_user)):
    """Get a user's profile by their ID (for viewing match profiles)"""
    from app.services.firebase_service import get_firebase_service
    
    firebase_service = get_firebase_service()
    profile = await firebase_service.get_user_profile(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    # Return only safe, public profile information
    return {
        "uid": profile.get("uid", user_id),
        "name": profile.get("name", "User"),
        "age": profile.get("age"),
        "gender": profile.get("gender"),
        "location": profile.get("location"),
        "interest_tags": profile.get("interest_tags", "")
    }

# Test authentication endpoint
@app.get("/api/auth/test")
async def test_auth(user: dict = Depends(get_current_user)):
    """Test authentication - requires JWT token"""
    return {
        "success": True,
        "message": f"Hello {user['email']}! Your JWT authentication is working.",
        "uid": user['uid'],
        "timestamp": datetime.now().isoformat()
    }

# Include routers (each router defines its own prefix and tags)
app.include_router(icebreaker.router)
app.include_router(ai_date_plan.router)
app.include_router(recommend.router)

# TODO: Add more routes as they're created
# from app.routes import chat
# app.include_router(chat.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
