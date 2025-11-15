# Tech Context

## Technologies Used

### Frontend ✅ IMPLEMENTED
- **React** v19.2.0 - Latest stable version with modern features
- **React Router DOM** v7.9.6 - Client-side routing with protected routes
- **React Scripts** v5.0.1 - Build tooling (Create React App)
- **Firebase SDK** v10.x - Authentication and Firestore
  - firebase/auth - Authentication
  - firebase/firestore - Database
  - firebase/analytics - Usage tracking
- **Testing**: Jest, React Testing Library, User Event (configured but not used yet)
- **Web Vitals** - Performance monitoring

### Firebase (BaaS) ✅ IMPLEMENTED
- **Firebase Authentication** - Email/password auth, JWT tokens
- **Firestore Database** - NoSQL document database, real-time sync
- **Firebase Analytics** - Usage tracking (configured)
- **Firebase Hosting** - Potential deployment target
- **Firebase SDK** - Direct client-side access
- **Project**: aidatingweb.firebaseapp.com
- **Project ID**: aidatingweb

### Backend ❌ NOT YET IMPLEMENTED
- **Python 3.x** - Core backend language (available)
- **Framework**: FastAPI (recommended, not yet installed)
  - **FastAPI**: Modern, fast, auto-docs, async support
  - **Alternative**: Flask (lighter but less features)
- **Dependencies** (to be installed):
  - fastapi - Web framework
  - uvicorn - ASGI server
  - firebase-admin - Backend Firebase SDK
  - googlemaps - Google Maps API client
  - openai - OpenAI API client (or anthropic for Claude)
  - python-dotenv - Environment variables
  - pydantic - Data validation
  - httpx - Async HTTP client

### External Services & APIs ⚠️ NOT YET CONFIGURED

#### Google Maps API (Critical for Date Planning)
- **Places API** - Search for locations (restaurants, activities, etc.)
- **Routes API** - Generate optimal routes between locations
- **Maps JavaScript API** - Display maps in frontend (optional)
- **Geocoding API** - Convert addresses to coordinates
- **Status**: API key not obtained, billing not set up
- **Free Tier**: $200/month credit

#### AI Services (Critical for Matching & Features)
- **OpenAI API** (Primary choice)
  - GPT-4 or GPT-3.5-turbo for icebreakers
  - Text generation and analysis
  - Cost: ~$0.002 per request (GPT-3.5)
- **Anthropic Claude API** (Alternative)
  - Claude-3 models
  - Similar capabilities to OpenAI
- **Status**: API keys not obtained

#### Firebase Admin SDK (Critical for Backend Auth)
- **firebase-admin** Python package
- **Service Account**: Need to download JSON key from Firebase Console
- **Purpose**: Verify JWT tokens from frontend, access Firestore from backend
- **Status**: Not configured

### Development Tools ✅ AVAILABLE
- **Git**: Version control (initialized ✅)
- **npm**: Frontend package management (v10.x)
- **pip**: Python package management (available)
- **VS Code**: Primary IDE
- **Python**: v3.x available
- **Node.js**: v20.x available
- **Docker**: Available (optional for deployment)

## Development Setup

### Frontend Setup ✅ COMPLETE
```bash
cd frontend
npm install          # Dependencies installed
npm start            # Runs on http://localhost:3000
npm test             # Run tests (not yet written)
npm run build        # Production build
```

**Status**: Working perfectly. Frontend runs on port 3000.

### Firebase Setup ✅ COMPLETE
- Firebase project created
- Firebase SDK configured in frontend
- Authentication enabled
- Firestore database initialized
- Users collection schema defined
- Security rules (default - need to customize)

### Backend Setup ❌ NOT YET STARTED
```bash
# Need to execute these commands
cd backend
python3 -m venv venv                    # Create virtual environment
source venv/bin/activate                # Activate (Unix/Mac)
# venv\Scripts\activate                 # Activate (Windows)

# Create requirements.txt first, then:
pip install -r requirements.txt         # Install dependencies

# Create .env file with API keys
# Create main.py with FastAPI app

uvicorn main:app --reload --port 8000   # Start server
# Server will run on http://localhost:8000
# API docs at http://localhost:8000/docs
```

**Status**: Commands ready to execute, but not yet run.

### Environment Variables Needed

#### Frontend (.env in frontend/)
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_FIREBASE_API_KEY=<already configured in firebase-config.js>
```

#### Backend (.env in backend/)
```bash
# Firebase Admin
FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json

# Google Maps
GOOGLE_MAPS_API_KEY=<to be obtained>

# OpenAI
OPENAI_API_KEY=<to be obtained>

# CORS (for development)
FRONTEND_URL=http://localhost:3000

# Optional
PORT=8000
ENVIRONMENT=development
```

**Status**: Template ready, need to populate with actual keys.

## Technical Constraints

### Time Constraints ⏰
- **12-hour hackathon** - Currently ~2-3 hours spent, ~9-10 hours remaining
- **Backend must be built**: ~6-8 hours of work ahead
- **Integration testing**: ~1-2 hours needed
- **Demo prep**: ~1 hour needed
- **Timeline**: Extremely tight, must prioritize MVP

### Deployment Constraints
- **Demo environment**: Not production-critical
- **Local development**: May demo from localhost
- **Deployment options**: 
  - Firebase Hosting (frontend) - Free
  - Railway (backend) - Free tier
  - Heroku (backend) - Free tier discontinued
  - Render (backend) - Free tier with cold starts
- **HTTPS**: Not critical for local demo

### API Constraints
- **Google Maps API**: 
  - Free tier: $200/month credit
  - Places API: ~$0.017 per request
  - Routes API: ~$0.005 per request
  - Demo usage: ~100-200 requests = ~$2-3
- **OpenAI API**:
  - Pay-as-you-go
  - GPT-3.5-turbo: ~$0.002 per request
  - Demo usage: ~50 requests = ~$0.10
- **Rate Limiting**: Not a concern for demo with limited usage

### Database Constraints
- **Firestore Free Tier**:
  - 50,000 document reads/day
  - 20,000 document writes/day
  - 1 GB storage
  - Perfect for hackathon demo ✅
- **No complex queries**: Firestore has limited query capabilities
- **Denormalization**: May need to duplicate data for efficiency

## Dependencies & Requirements

### Frontend Dependencies ✅ INSTALLED
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.9.6",
  "react-scripts": "5.0.1",
  "firebase": "^10.x",
  "web-vitals": "^2.1.4"
}
```

### Backend Requirements ❌ TO BE CREATED
```txt
# backend/requirements.txt (to be created)
fastapi==0.104.1
uvicorn[standard]==0.24.0
firebase-admin==6.2.0
googlemaps==4.10.0
openai==1.3.0
python-dotenv==1.0.0
pydantic==2.5.0
httpx==0.25.0
python-multipart==0.0.6
```

**Status**: File doesn't exist yet. Need to create and install.

## Tool Usage Patterns

### Git Workflow ✅
- Repository initialized
- Regular commits during development
- Main branch for stable code
- Feature branches optional (time-constrained)

### API Development Patterns 🔄 TO BE IMPLEMENTED
- RESTful endpoints with clear naming
- JSON request/response format
- HTTP status codes: 200 (success), 401 (unauthorized), 400 (bad request), 500 (error)
- FastAPI automatic OpenAPI documentation at /docs
- Request validation with Pydantic models
- Async/await for non-blocking operations

### Testing Strategy ⚠️ TIME PERMITTING
- **Priority**: Manual testing (time constraint)
- **Unit tests**: If time permits for critical logic
- **Integration tests**: Manual endpoint testing
- **Tools**: Postman, Thunder Client, or FastAPI /docs
- **Focus**: Matching algorithm and date planning logic

### Error Handling Patterns 🔄 TO BE IMPLEMENTED
- Try-catch blocks in backend
- Proper HTTP status codes
- User-friendly error messages in frontend
- Logging for debugging
- Fallback responses for API failures

## Technology Stack Recommendations

### Confirmed Stack ✅
1. **React 19.2.0** - Frontend (implemented ✅)
2. **Firebase Auth + Firestore** - Authentication and database (implemented ✅)
3. **FastAPI** - Backend framework (recommended, not implemented)
4. **Google Maps API** - Location services (not configured)
5. **OpenAI API** - AI features (not configured)

### Why FastAPI? 🎯
- **Auto-documentation**: /docs endpoint with Swagger UI
- **Type hints**: Python type hints for better code quality
- **Async support**: Non-blocking API calls
- **Fast development**: Minimal boilerplate
- **Modern**: Based on latest Python standards
- **Perfect for hackathon**: Speed without sacrificing quality

### Alternative: Flask
- **Pros**: Simpler, lighter, more familiar to some
- **Cons**: No auto-docs, more manual work, less modern
- **Verdict**: FastAPI is better for this project

## Development Priorities

### Phase 1: Backend Foundation ❌ CRITICAL - 1 hour
1. Create backend directory structure
2. Create main.py with FastAPI app
3. Create requirements.txt
4. Set up virtual environment
5. Install dependencies
6. Configure CORS for localhost:3000
7. Create /api/health endpoint
8. Test server runs on port 8000
9. Verify CORS with frontend fetch

### Phase 2: Firebase Admin Integration ❌ HIGH - 45 min
1. Download Firebase service account key from console
2. Install firebase-admin package
3. Initialize Firebase Admin in backend
4. Create auth middleware (verify_token)
5. Protect endpoints with Depends(verify_token)
6. Test JWT verification with real token from frontend

### Phase 3: AI Matching ❌ HIGH - 2 hours
1. Create /api/matches/suggestions endpoint
2. Query Firestore for all users
3. Implement scoring algorithm:
   - Interest overlap (40% weight)
   - Age compatibility (30% weight)
   - Location proximity (20% weight)
   - Active status (10% weight)
4. Return sorted matches
5. Test with sample data

### Phase 4: Date Planning ❌ CRITICAL - 3 hours
1. Obtain Google Maps API key
2. Enable Places and Routes APIs
3. Install googlemaps library
4. Create /api/ai/date-plan endpoint
5. Implement vibe analysis logic
6. Query Google Places API
7. Generate optimal route
8. Format itinerary response
9. Test with various inputs

### Phase 5: Icebreaker Generator ❌ MEDIUM - 1 hour
1. Obtain OpenAI API key
2. Install openai library
3. Create /api/ai/icebreaker endpoint
4. Design prompt template
5. Call OpenAI API
6. Return icebreaker
7. Test with sample profiles

### Phase 6: Frontend Integration ❌ HIGH - 1-2 hours
1. Create frontend/src/services/api.js
2. Add REACT_APP_API_URL to frontend/.env
3. Update Matches page to fetch from backend
4. Update DatePlanner page for date planning
5. Add loading and error states
6. Test end-to-end flow

## Current Blockers 🚫

### Critical Blockers
1. **No backend server** - Blocks all AI features
2. **No Google Maps API key** - Blocks date planning (differentiator)
3. **No OpenAI API key** - Blocks icebreaker generation
4. **No Firebase service account** - Blocks backend authentication

### Time Blockers
- **9-10 hours remaining** for ~10-11 hours of work
- Must focus on MVP only
- May need to skip optional features

## Next Immediate Actions

### Right Now (Next 1 hour) ⚡
1. Create backend/main.py
2. Create backend/requirements.txt
3. Set up virtual environment
4. Install dependencies
5. Test basic FastAPI server
6. Verify CORS works

### Next (After backend foundation)
1. Obtain Google Maps API key (critical)
2. Obtain OpenAI API key
3. Download Firebase service account key
4. Continue with Phase 2 (Firebase Admin)

## Tools & Commands Reference

### Python Virtual Environment
```bash
# Create
python3 -m venv venv

# Activate (Unix/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Deactivate
deactivate
```

### FastAPI Development
```bash
# Install
pip install fastapi uvicorn

# Run with auto-reload
uvicorn main:app --reload --port 8000

# View API docs
# Open http://localhost:8000/docs
```

### Testing Backend
```bash
# Health check
curl http://localhost:8000/api/health

# Test with authorization
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/matches/suggestions
```

## Firebase Admin Setup
```bash
# Install
pip install firebase-admin

# Download service account key
# Firebase Console → Project Settings → Service Accounts → Generate New Private Key

# Save as backend/firebase-service-account.json
# Add to .gitignore
```

## Notes for Implementation

### What Works ✅
- Frontend fully functional with Firebase
- Authentication flow complete
- User profiles being created
- Protected routes working
- Clean code structure

### What's Needed ⚠️
- Backend server (everything depends on this)
- API keys (Google Maps, OpenAI)
- Firebase Admin setup
- Frontend-backend integration
- Testing with real data

### What to Avoid ❌
- Over-engineering the backend
- Complex database queries
- Unnecessary abstractions
- Perfect code over working code
- Adding features beyond MVP

### Time-Saving Tips 💡
- Use FastAPI /docs for testing
- Copy-paste Firebase Admin boilerplate
- Use simple matching algorithm first
- Test each endpoint before moving on
- Focus on date planning (differentiator)
- Skip message interpreter if time runs out
