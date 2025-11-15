# Active Context

## Current Focus: Backend Development

**PRIMARY OBJECTIVE**: Build the Python backend for AIDatingWeb. Frontend is being handled by another team member and should not be a focus area at this time.

## Recent Changes
- Initialized memory bank documentation system
- Documented project requirements, architecture, and tech stack
- Established backend development as primary focus area
- Frontend has basic authentication pages (Login/Register) implemented by other team member

## Current Work Status

### What We're Building
The backend API for AIDatingWeb with the following priorities:
1. **Authentication System** (Essential - blocking other features)
2. **User Profile Management** (Essential - required for matching)
3. **AI Matching Algorithm** (Core Feature)
4. **Conversation System** (Core Feature)
5. **Date Map & Smart Route Planning** (Core Feature - Google Maps integration)
6. **AI Secondary Features** (Icebreaker generator, message interpreter)

### Backend Development Status
**NOT STARTED** - Backend directory and infrastructure need to be created.

## Next Steps (In Priority Order)

### 1. Technology Stack Decisions
Before writing any code, need to finalize:
- [ ] **Framework**: FastAPI vs Flask (Recommendation: FastAPI)
- [ ] **Database**: PostgreSQL vs MongoDB (Recommendation: PostgreSQL with SQLite for dev)
- [ ] **AI Service**: OpenAI, Anthropic Claude, or other
- [ ] **Deployment Strategy**: Docker, traditional hosting, cloud platform

### 2. Backend Project Structure
Create the backend directory with proper structure:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── dependencies.py      # Dependency injection
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── match.py
│   │   └── message.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── auth.py
│   │   └── ...
│   ├── routes/              # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── matches.py
│   │   ├── conversations.py
│   │   ├── dates.py
│   │   └── ai.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── matching_service.py
│   │   ├── maps_service.py
│   │   └── ai_service.py
│   └── utils/               # Helper functions
│       ├── __init__.py
│       ├── security.py      # Password hashing, JWT
│       └── helpers.py
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   └── ...
├── alembic/                 # Database migrations
├── .env.example             # Example environment variables
├── requirements.txt         # Python dependencies
└── README.md
```

### 3. Initial Backend Setup
- [ ] Create backend directory structure
- [ ] Set up Python virtual environment
- [ ] Create requirements.txt with dependencies
- [ ] Create .env.example file
- [ ] Initialize FastAPI application with basic "Hello World"
- [ ] Set up database connection (SQLite for development)
- [ ] Configure CORS for frontend communication

### 4. Authentication System (FIRST FEATURE)
This is blocking all other features:
- [ ] Design User model (database schema)
- [ ] Implement user registration endpoint
- [ ] Implement password hashing with bcrypt
- [ ] Implement login endpoint with JWT token generation
- [ ] Implement token refresh mechanism
- [ ] Add protected route decorator
- [ ] Test authentication flow

### 5. User Profile Management
- [ ] Design Profile model with fields: name, age, gender, interests, location, bio, photos
- [ ] Implement profile creation/update endpoints
- [ ] Add profile image upload (optional for v1)
- [ ] Implement profile retrieval endpoints

### 6. Database Design & Models
Core tables needed:
- **users**: id, email, password_hash, created_at, updated_at
- **profiles**: id, user_id, name, age, gender, location, interests, bio, preferences
- **matches**: id, user1_id, user2_id, status, score, created_at
- **conversations**: id, match_id, created_at
- **messages**: id, conversation_id, sender_id, content, timestamp, read
- **date_plans**: id, user_id, vibe, locations, route, created_at

## Active Decisions & Considerations

### Decision: Backend Framework
**Leaning toward FastAPI** because:
- Automatic API documentation (critical for frontend team)
- Modern async support (better for external API calls)
- Type hints and validation with Pydantic
- Better performance for API-heavy application
- Growing industry adoption

**Trade-off**: Slightly steeper learning curve vs Flask, but benefits outweigh this.

### Decision: Database
**Recommendation: PostgreSQL for production, SQLite for development**
- Start with SQLite for rapid development (zero setup)
- User profiles and relationships fit relational model well
- PostgreSQL has JSON fields if needed for flexible data
- Easy migration path from SQLite to PostgreSQL

### Decision: AI Service Provider
**Need to decide based on**:
- Cost per API call
- Quality of responses for dating context
- Rate limits
- Features needed (text generation, embeddings for matching)

**Options**:
- OpenAI GPT-4: Most capable, higher cost
- Anthropic Claude: Strong reasoning, moderate cost
- OpenAI GPT-3.5: Lower cost, good for simpler tasks

**Consideration**: May use different models for different features:
- Embeddings for matching: OpenAI text-embedding-ada-002
- Text generation (icebreakers): GPT-3.5 or Claude
- Message interpretation: GPT-3.5

### Decision: Real-time Messaging
**Options**:
1. WebSockets (Socket.io)
2. Server-Sent Events (SSE)
3. Long polling

**Recommendation**: Start with polling for MVP, add WebSockets later for real-time experience.

### Decision: Google Maps Integration
- Need Google Maps API key (get from Google Cloud Console)
- Use Places API for location search
- Use Directions API for route planning
- Consider caching common routes to reduce API costs

## Important Patterns & Preferences

### Code Organization
- **Separation of Concerns**: Routes → Services → Models
- Routes handle HTTP, Services handle business logic, Models handle data
- Keep routes thin, logic in services

### API Design
- Follow RESTful principles
- Version API endpoints (/api/v1/)
- Consistent response format (success, data, error)
- Proper HTTP status codes

### Error Handling
- Consistent error response format
- Proper exception handling
- Informative error messages (but not exposing internals)
- Log all errors for debugging

### Testing Strategy
- Write tests for authentication first (critical path)
- Test services independently from routes
- Use pytest fixtures for database setup/teardown
- Mock external API calls in tests

## Learnings & Project Insights

### Frontend-Backend Coordination
- Frontend expects specific response format - need to coordinate
- Authentication flow must match frontend implementation
- API endpoints should match frontend's expected routes
- Frontend team member handles UI/UX decisions

### AI Feature Implementation Priority
1. Matching algorithm (essential core feature)
2. Date planning (unique differentiator)
3. Icebreaker generator (nice-to-have, enhances UX)
4. Message interpreter (nice-to-have, secondary feature)

### MVP Scope
For initial version, can defer:
- OAuth login (use email/password first)
- Advanced profile features (photos, detailed preferences)
- Real-time messaging (use polling)
- Message read receipts
- Complex matching algorithm (start with simple location + interests)

Focus on getting basic flow working:
User Registration → Profile Creation → Simple Matching → Basic Messaging → Date Planning

## Open Questions

1. **AI Service Budget**: What's the budget for AI API calls? This affects provider choice.
2. **Google Maps API**: Do we have API key? What's the usage limit/budget?
3. **Database Hosting**: Where will PostgreSQL be hosted in production?
4. **Deployment**: Docker? Cloud platform (AWS, GCP, Azure)? Traditional hosting?
5. **Frontend Expectations**: What exactly does frontend team expect from API responses?
6. **Timeline**: What's the timeline for MVP? This affects scope decisions.

## Blockers & Risks

### Current Blockers
- None yet (just starting)

### Potential Risks
1. **External API Costs**: Google Maps and AI services can get expensive with usage
2. **Matching Algorithm Complexity**: May need significant tuning to provide quality matches
3. **Real-time Features**: WebSocket implementation adds complexity
4. **Data Privacy**: Dating app data is sensitive, need proper security measures
5. **Scale**: Real-time matching and messaging can be resource-intensive

### Mitigation Strategies
- Start with simpler implementations, iterate
- Use caching aggressively for external APIs
- Implement rate limiting early
- Focus on security from day one
- Plan for horizontal scaling (stateless services)
