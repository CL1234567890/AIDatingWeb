# System Patterns

## System Architecture

### Overall Structure - Hybrid Approach (IMPLEMENTED)
```
Frontend (React) <-> Firebase BaaS <-> Backend (Python/FastAPI) <-> External APIs
     |                    |                        |
     |                    |                        +-> Google Maps API
     +--------------------+                        +-> OpenAI/Anthropic API
     (Direct Firebase SDK access)
```

**Architecture Style**: Hybrid BaaS + Custom Backend
- Frontend: Single Page Application (SPA) with React + Firebase SDK
- Firebase: Backend-as-a-Service (authentication, database, real-time)
- Backend: Python/FastAPI for AI features only
- Communication: HTTP/HTTPS with JSON payloads + Firebase SDK

### Key Components

#### Frontend (React) - IMPLEMENTED ✅
```
src/
├── components/
│   └── Navbar.js              # Navigation with auth state
├── contexts/
│   └── AuthContext.js         # Global auth state management
├── pages/
│   ├── Login.js               # Firebase auth login
│   ├── Register.js            # Firebase auth + Firestore profile
│   ├── Dashboard.js           # Main landing after login
│   ├── Matches.js             # Match suggestions (placeholder)
│   ├── Chat.js                # Messaging (placeholder)
│   └── DatePlannar.js         # AI date planning (placeholder)
├── firebase-config.js         # Firebase initialization
├── App.js                     # Router + AuthProvider
└── index.js                   # Application entry point
```

#### Firebase (BaaS) - IMPLEMENTED ✅
- **Authentication**: Email/password, JWT tokens
- **Firestore Database**: 
  - users collection (profiles)
  - matches collection (planned)
  - conversations collection (planned)
  - messages subcollection (planned)
- **Real-time sync**: Firestore listeners for messages
- **Security**: Firestore security rules

#### Backend (Python/FastAPI) - NOT YET IMPLEMENTED ⚠️
```
backend/
├── main.py                    # FastAPI app + CORS
├── requirements.txt           # Dependencies
├── .env                       # Environment variables
├── app/
│   ├── models/                # Data models/schemas
│   ├── routes/                # API endpoints
│   │   ├── matches.py         # Matching algorithm
│   │   ├── ai_date_plan.py    # Date planning
│   │   └── ai_icebreaker.py   # Icebreaker generation
│   ├── services/              # Business logic
│   │   ├── firebase_service.py  # Firestore queries
│   │   ├── matching_service.py  # Match scoring
│   │   ├── maps_service.py      # Google Maps integration
│   │   └── ai_service.py        # OpenAI integration
│   └── utils/                 # Helper functions
│       └── auth.py            # Firebase JWT verification
└── venv/                      # Virtual environment
```

### Component Relationships

1. **Authentication Flow** ✅ IMPLEMENTED
   ```
   User Input → Firebase Auth → JWT Token → AuthContext → Protected Routes
                                      ↓
                               Firestore Profile Creation
   ```
   
2. **User Profile Flow** ✅ IMPLEMENTED
   ```
   Register → Firebase Auth → Create User Doc in Firestore
   Login → Firebase Auth → Fetch Profile from Firestore → AuthContext
   ```
   
3. **Matching Flow** ❌ NOT IMPLEMENTED
   ```
   Frontend → Backend API → Firestore Query → Match Scoring → Ranked Results
                                ↑
                          Firebase JWT Verification
   ```
   
4. **Messaging Flow** 🔄 PARTIAL (Firebase ready, UI pending)
   ```
   Frontend → Firestore Messages → Real-time Listener → Display Messages
   ```
   
5. **Date Planning Flow** ❌ NOT IMPLEMENTED
   ```
   Frontend Input → Backend API → Vibe Analysis → Google Maps API → 
   Route Generation → Response with Itinerary
   ```

## Key Technical Decisions

### Frontend Decisions ✅
1. **React 19.2.0**: Latest stable version, fast refresh
2. **React Router DOM v7.9.6**: Client-side routing with protected routes
3. **Firebase SDK Direct Access**: Frontend directly uses Firebase for auth/database
4. **Context API**: AuthContext for global authentication state
5. **Protected Route Pattern**: HOC wrapper for authenticated routes

### Firebase Decisions ✅
1. **Firebase Authentication**: Eliminates custom auth backend (saves 2-3 hours)
2. **Firestore Database**: NoSQL, real-time, no setup needed
3. **Security Rules**: Database-level access control
4. **Direct SDK Access**: Frontend can read/write Firestore directly (with rules)

### Backend Decisions 🔄
1. **FastAPI**: Modern Python framework, auto-documentation, async support
2. **AI Features Only**: Backend focuses exclusively on AI/ML features
3. **Firebase Admin SDK**: Verifies JWT tokens from frontend
4. **Stateless**: No session storage, JWT verification only
5. **CORS Enabled**: Allows localhost:3000 during development

### API Integration Decisions ⚠️
1. **Google Maps API**: For location services and route planning (not yet configured)
2. **OpenAI API**: For icebreakers and message interpretation (not yet configured)
3. **Firebase Admin**: For backend to access Firestore (not yet configured)

## Design Patterns in Use

### Frontend Patterns ✅ IMPLEMENTED
1. **Provider Pattern**: AuthProvider wraps entire app
2. **Custom Hook Pattern**: useAuth() for accessing auth context
3. **Protected Route Pattern**: ProtectedRoute HOC component
4. **Async/Await Pattern**: For Firebase operations
5. **Error Boundary Pattern**: Try-catch with user-friendly messages
6. **Loading State Pattern**: Disabled buttons during async operations
7. **Controlled Components**: Form inputs with state

### Backend Patterns 🔄 TO BE IMPLEMENTED
1. **Dependency Injection**: FastAPI Depends() for auth middleware
2. **Service Layer Pattern**: Separate business logic from routes
3. **Repository Pattern**: Firebase service for database access
4. **Middleware Pattern**: JWT verification, CORS, error handling
5. **Factory Pattern**: For creating API clients (Google Maps, OpenAI)
6. **Strategy Pattern**: Different matching algorithms based on preferences

## Critical Implementation Paths

### Path 1: Authentication ✅ COMPLETE
```
User Input → Firebase Auth → JWT Token → Firestore Profile → AuthContext → 
Protected Routes → Authorized Access
```
**Status**: Fully working. Login, register, logout, profile creation all functional.

### Path 2: Matching Algorithm ❌ NOT IMPLEMENTED
```
User Profile → Backend API → Firestore Query → Interest Overlap Score → 
Age Compatibility → Location Distance → Sorted Results → Frontend Display
```
**Status**: Backend doesn't exist yet. Need to implement scoring logic.

### Path 3: AI-Powered Date Planning ❌ NOT IMPLEMENTED (CRITICAL)
```
User Input (vibe/preferences) → Backend API → Vibe Analysis → 
Google Places API → Location Filtering → Route Optimization → 
Itinerary Generation → Frontend Display with Map
```
**Status**: This is the differentiator. Requires Google Maps API key and backend.

### Path 4: Real-time Messaging 🔄 FIREBASE READY
```
Message Send → Firestore Messages Collection → Real-time Listener → 
Recipient Display (instant sync)
```
**Status**: Firestore is ready for messages. Need UI implementation.

## Architecture Principles

1. **Separation of Concerns**: Firebase handles auth/data, backend handles AI ✅
2. **API-First Design**: Well-defined API contracts between components 🔄
3. **Scalable Structure**: Firebase scales automatically, backend is stateless ✅
4. **Security-Focused**: Firebase security rules, JWT verification, input validation 🔄
5. **Hackathon-Optimized**: Pragmatic choices favoring speed ✅

## Integration Points

1. **Frontend ↔ Firebase**: Direct SDK access (auth, firestore) ✅ IMPLEMENTED
2. **Frontend ↔ Backend**: REST API with JSON ❌ NOT IMPLEMENTED
3. **Backend ↔ Firebase**: Firebase Admin SDK for auth verification ❌ NOT IMPLEMENTED
4. **Backend ↔ Google Maps API**: HTTP requests for places/routes ❌ NOT IMPLEMENTED
5. **Backend ↔ OpenAI**: API calls for AI features ❌ NOT IMPLEMENTED

## Current Implementation Status

### Completed ✅
- Frontend structure with React Router
- Firebase authentication (login, register, logout)
- AuthContext for global state
- Protected routes
- Firestore profile creation
- Error handling and loading states
- Navigation component

### In Progress 🔄
- Memory bank documentation updates

### Not Started ❌
- Backend server (FastAPI)
- Firebase Admin SDK integration
- Matching algorithm
- Date planning AI
- Icebreaker generator
- Frontend-backend integration
- Google Maps integration
- OpenAI integration

## Firebase Schema (Implemented)

### users collection ✅
```javascript
{
  uid: string,               // Firebase Auth UID
  email: string,             // User email
  profile: {
    name: string,
    age: number | null,
    gender: string,
    interests: array,
    location: object | null,
    bio: string,
    photos: array
  },
  preferences: {
    ageRange: [min, max],
    distance: number,
    interests: array
  },
  createdAt: string,         // ISO timestamp
  lastActive: string         // ISO timestamp
}
```

### matches collection (planned) ⚠️
```javascript
{
  id: string,
  user1: string,             // UID
  user2: string,             // UID
  user1Status: string,       // "liked" | "passed" | "matched"
  user2Status: string,
  matchScore: number,        // AI-calculated score
  matchedAt: timestamp,
  conversationId: string
}
```

### conversations collection (planned) ⚠️
```javascript
{
  id: string,
  participants: [uid1, uid2],
  lastMessage: string,
  lastMessageAt: timestamp,
  createdAt: timestamp
}
```

### messages subcollection (planned) ⚠️
```javascript
{
  id: string,
  senderId: string,
  text: string,
  timestamp: timestamp,
  read: boolean
}
```

## API Endpoints (To Be Implemented)

### Backend REST API
```
GET  /api/health                  # Health check
POST /api/matches/suggestions     # Get AI match suggestions
POST /api/ai/date-plan            # Generate date itinerary
POST /api/ai/icebreaker           # Generate icebreaker
POST /api/ai/interpret-message    # Interpret message (optional)
```

All endpoints require Firebase JWT token in Authorization header.

## Next Implementation Priority

1. **Create backend/main.py** - Foundation for all AI features
2. **Configure Firebase Admin** - Enable backend auth verification
3. **Build matching algorithm** - Core feature
4. **Integrate Google Maps** - Differentiator feature (date planning)
5. **Connect frontend to backend** - Complete the integration
