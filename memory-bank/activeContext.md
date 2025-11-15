# Active Context

## Current Work Focus

**PRIMARY FOCUS: Backend Development**

User is working in tandem with other team members who are handling the frontend. Therefore, all efforts should prioritize backend implementation and API development.

### Immediate Priorities
1. Set up backend project structure (Python)
2. Select and configure framework (recommend FastAPI)
3. Initialize database and create models
4. Implement authentication system
5. Build core API endpoints for frontend integration

## Recent Changes

### Project Initialization
- Created memory bank documentation structure
- Frontend skeleton established (by other team members)
  - React app initialized
  - Basic routing with Login/Register pages
  - Navbar component created
- Backend not yet started - this is the immediate priority

## Next Steps

### Step 1: Backend Foundation (IMMEDIATE)
- [ ] Create backend directory structure
- [ ] Set up Python virtual environment
- [ ] Choose framework (recommend FastAPI)
- [ ] Create requirements.txt with dependencies
- [ ] Set up basic server and test endpoint

### Step 2: Database Setup
- [ ] Design database schema for users, matches, messages
- [ ] Choose database (recommend SQLite for hackathon)
- [ ] Set up SQLAlchemy models
- [ ] Create database initialization script

### Step 3: Authentication System
- [ ] Implement user registration endpoint
- [ ] Implement login endpoint with JWT
- [ ] Create password hashing utilities
- [ ] Add authentication middleware/decorators

### Step 4: Core API Endpoints
- [ ] User profile CRUD endpoints
- [ ] Match retrieval endpoints
- [ ] Messaging endpoints
- [ ] Enable CORS for frontend integration

### Step 5: AI Integration (Differentiator)
- [ ] Set up Google Maps API integration
- [ ] Implement date planning algorithm with vibe analysis
- [ ] Create endpoint for personalized date suggestions
- [ ] Implement icebreaker generator (if time)
- [ ] Implement message interpreter (if time)

## Active Decisions and Considerations

### Framework Selection
**Recommendation: FastAPI**
- Automatic API documentation (Swagger UI)
- Modern async support
- Fast development with Python type hints
- Easy to learn, powerful for hackathon

**Alternative: Flask**
- More familiar to many developers
- Larger ecosystem
- Slightly more manual setup

### Database Selection
**Recommendation: SQLite**
- Zero configuration
- File-based, easy to include in demo
- Perfect for 12-hour hackathon
- Can migrate to PostgreSQL later if needed

### Authentication Strategy
**Recommendation: JWT**
- Stateless (no session storage needed)
- Works well with React frontend
- Simple to implement
- Standard industry practice

### API Structure
```
/api/auth/
  POST /register
  POST /login
  POST /logout (optional)
  GET /me (get current user)

/api/users/
  GET /profile/:id
  PUT /profile
  DELETE /profile

/api/matches/
  GET / (get potential matches)
  POST /:id/like
  POST /:id/pass
  GET /matched (get confirmed matches)

/api/messages/
  GET /conversations
  GET /:conversation_id
  POST /:conversation_id
  POST /icebreaker (AI feature)
  POST /interpret (AI feature)

/api/dates/
  POST /plan (AI-powered date planning)
  GET /locations (Google Maps integration)
```

## Important Patterns and Preferences

### Code Organization
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app initialization
│   ├── config.py         # Configuration
│   ├── database.py       # Database setup
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── utils/            # Helpers (auth, etc.)
│   └── ai/               # AI integrations
├── requirements.txt
├── .env.example
├── .env
└── README.md
```

### Development Workflow
1. Backend runs on port 5000 (or 8000 for FastAPI default)
2. Frontend runs on port 3000
3. CORS enabled for local development
4. Environment variables in .env file
5. API documentation auto-generated at /docs

### Error Handling
- Consistent JSON error responses
- Appropriate HTTP status codes
- Validation errors clearly communicated
- Logging for debugging during hackathon

## Learnings and Project Insights

### Hackathon Optimization
- Prioritize working features over perfect code
- Use proven libraries rather than custom solutions
- SQLite for database = instant setup
- FastAPI = automatic documentation for frontend team
- JWT = no session management complexity

### Integration Points
- Frontend team needs API endpoint documentation
- Use FastAPI's automatic Swagger docs for communication
- Define clear response formats upfront
- Test endpoints with Postman/Thunder Client before frontend integration

### AI Features as Differentiator
- Date planning with vibe analysis is the standout feature
- Must work reliably for demo
- Icebreaker and message interpreter are "nice to have"
- Budget API calls carefully during development

## Coordination with Frontend Team

### Communication Needs
- Share API endpoint documentation (FastAPI /docs)
- Define JSON response structures
- Agree on authentication flow
- Test integration points together
- Deploy backend where frontend can access it

### Ready for Frontend Integration
Once these backend pieces are ready:
1. Authentication endpoints working
2. User profile endpoints working
3. CORS configured correctly
4. API documented and accessible
5. Test data available for development

## Environment Setup Checklist
- [ ] Python 3.8+ installed
- [ ] pip available
- [ ] Virtual environment created
- [ ] .env file with API keys
- [ ] Google Maps API key obtained
- [ ] OpenAI/Anthropic API key obtained
- [ ] Git repository configured

## Current Blockers
None - Ready to start backend development!

## Questions to Resolve
1. Confirm framework choice (FastAPI recommended)
2. Obtain necessary API keys (Google Maps, OpenAI)
3. Determine deployment strategy for demo
4. Coordinate with frontend team on API contract
