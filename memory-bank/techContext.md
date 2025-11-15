# Tech Context

## Technologies Used

### Frontend (Handled by Other Team Members)
- **React** v19.2.0 - Modern UI framework
- **React Router DOM** v7.9.6 - Client-side routing
- **React Scripts** v5.0.1 - Build tooling (Create React App)
- **Testing**: Jest, React Testing Library, User Event
- **Web Vitals** - Performance monitoring

### Backend (Primary Focus)
- **Python** - Core backend language
- **Framework**: TBD - Need to select (Flask, FastAPI, or Django)
  - **Flask**: Lightweight, flexible, good for hackathon speed
  - **FastAPI**: Modern, fast, automatic API docs, excellent async support
  - **Django**: Full-featured, more overhead but batteries-included
- **Authentication**: JWT or session-based (decision pending)
- **Database**: TBD - Options:
  - **SQLite**: Zero setup, perfect for hackathon/demo
  - **PostgreSQL**: Production-ready, robust
  - **MongoDB**: NoSQL, flexible schema
- **ORM**: Depends on framework choice
  - SQLAlchemy (Flask/FastAPI)
  - Django ORM (Django)

### External Services & APIs
1. **Google Maps API**
   - Places API for location search
   - Routes API for route planning
   - Maps JavaScript API for frontend display
   
2. **AI Services** (TBD)
   - OpenAI API (GPT-4/GPT-3.5) for icebreakers and message interpretation
   - Anthropic Claude API (alternative)
   - Need API keys and configuration

### Development Tools
- **Git**: Version control
- **npm**: Frontend package management
- **pip**: Python package management
- **VS Code**: Primary IDE

## Development Setup

### Frontend Setup (Handled by Team)
```bash
cd frontend
npm install
npm start  # Runs on port 3000
```

### Backend Setup (To Be Established)
```bash
cd backend  # Directory needs to be created
python -m venv venv  # Virtual environment
# Windows: venv\Scripts\activate
# Unix: source venv/bin/activate
pip install -r requirements.txt
# Start server (command depends on framework)
```

## Technical Constraints

### Time Constraints
- **12-hour hackathon** - Prioritize MVP features
- Focus on backend functionality over polish
- Use libraries/frameworks that accelerate development

### Deployment Constraints
- Demo environment (not production)
- May run locally or use simple hosting (Heroku, Vercel, Railway)
- HTTPS not critical for demo but good to have

### API Constraints
- Google Maps API has usage limits (free tier)
- AI API calls cost money (need to manage token usage)
- Rate limiting considerations for demo

## Dependencies & Requirements

### Backend Requirements (To Be Created)
```
# Core framework (one of):
flask / fastapi / django

# Database
sqlalchemy / psycopg2 / pymongo

# Authentication
pyjwt / flask-jwt-extended

# API integrations
requests
googlemaps
openai / anthropic

# CORS (for React integration)
flask-cors / fastapi-cors-middleware

# Environment variables
python-dotenv

# Development
pytest (testing)
```

### Environment Variables Needed
```
DATABASE_URL=<database connection string>
JWT_SECRET_KEY=<secret for JWT tokens>
GOOGLE_MAPS_API_KEY=<Google Maps API key>
OPENAI_API_KEY=<OpenAI API key>
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

## Tool Usage Patterns

### Git Workflow
- Feature branches for major components
- Regular commits during hackathon
- Main branch stays deployable

### API Development
- RESTful endpoints
- JSON request/response format
- Clear error handling and status codes
- API documentation (Swagger/OpenAPI if using FastAPI)

### Testing Strategy (If Time Permits)
- Unit tests for critical backend logic
- API endpoint testing
- Focus on matching algorithm and date planning logic

## Backend Technology Recommendations

**Recommended Stack for Hackathon:**
1. **FastAPI** - Modern, fast development, automatic docs
2. **SQLite** - Zero configuration, perfect for demo
3. **SQLAlchemy** - Flexible ORM
4. **JWT** - Stateless authentication
5. **OpenAI API** - Reliable AI features
6. **Google Maps API** - Standard location services

**Rationale:**
- FastAPI provides speed and automatic API documentation
- SQLite eliminates database setup time
- JWT keeps backend stateless and simple
- Standard APIs with good Python libraries

## Development Priorities

### Phase 1: Foundation (Backend Focus)
1. Set up Python backend project structure
2. Choose and configure framework
3. Set up database models
4. Create authentication endpoints

### Phase 2: Core Features (Backend Focus)
1. User profile API endpoints
2. Matching algorithm implementation
3. Messaging API endpoints
4. Database relationships and queries

### Phase 3: AI Integration (Backend Focus)
1. Google Maps API integration
2. Date planning algorithm with vibe analysis
3. Icebreaker generator (if time)
4. Message interpreter (if time)

### Phase 4: Integration
1. CORS configuration for frontend
2. API testing with frontend team
3. Bug fixes and adjustments
4. Demo preparation
