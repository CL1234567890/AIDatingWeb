"""
FastAPI Backend for AI Dating App
Main application entry point
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.routes import ai_date_plan
import os

# Import Firebase initialization
from app.utils.auth import initialize_firebase, get_current_user

# Initialize FastAPI app
app = FastAPI(
    title="AI Dating App API",
    description="Backend API for AI-powered dating application",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI at /docs
    redoc_url="/redoc"  # ReDoc at /redoc
)

# Initialize Firebase Admin SDK on startup
@app.on_event("startup")
async def startup_event():
    """Initialize services on app startup"""
    print("🚀 Starting AI Dating App Backend...")
    initialize_firebase()
    print("✅ Backend startup complete")

# Configure CORS - allows frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - basic API info"""
    return {
        "message": "AI Dating App API",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "ai-dating-backend"
    }

# Test endpoint
@app.get("/api/test")
async def test_endpoint():
    """Test endpoint to verify API is working"""
    return {
        "message": "Backend is working!",
        "timestamp": datetime.now().isoformat()
    }

# Protected endpoint - requires JWT authentication
@app.get("/api/user/profile")
async def get_user_profile(user: dict = Depends(get_current_user)):
    """
    Protected endpoint - requires valid Firebase JWT token
    Returns the authenticated user's information
    """
    return {
        "success": True,
        "user": {
            "uid": user['uid'],
            "email": user['email'],
            "email_verified": user.get('email_verified', False),
            "name": user.get('name'),
        },
        "message": "Authentication successful!"
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




# TODO: Import route modules here when they're created
app.include_router(
    ai_date_plan.router,
    prefix="/api",  
)




if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
