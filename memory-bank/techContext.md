# Tech Context

## Technology Stack

### Frontend (Handled by Another Team Member)
- **Framework**: React 19.2.0
- **Routing**: React Router DOM v7.9.6
- **Build Tool**: React Scripts 5.0.1
- **Testing**: Jest, React Testing Library
- **Language**: JavaScript (ES6+)

### Backend (PRIMARY FOCUS)
- **Language**: Python
- **Framework**: TBD (Flask or FastAPI recommended)
- **Authentication**: JWT or session-based (to be decided)
- **Database**: TBD (PostgreSQL, MongoDB, or MySQL)
- **ORM/ODM**: TBD (SQLAlchemy for SQL, PyMongo for MongoDB)

### External Services & APIs
- **Google Maps API**: For date location and route planning
- **AI Services**: For matching, icebreaker generation, and message interpretation
  - Options: OpenAI, Anthropic Claude, or custom models
- **OAuth Providers**: Google, Facebook, etc. (secondary feature)

### Development Tools
- **Version Control**: Git (repository: https://github.com/CL1234567890/AIDatingWeb.git)
- **Package Manager**: npm (frontend), pip (backend)
- **IDE**: Visual Studio Code
- **Available CLI Tools**: git, docker, kubectl, npm, pip, curl, jq, python, node, psql, sqlite3

## Technical Constraints

### Backend Priority
**IMPORTANT**: Backend development is the current priority. Frontend is being handled by another team member. Focus should be on:
1. API design and implementation
2. Database schema and models
3. Authentication system
4. Core business logic (matching, AI features)
5. External API integrations (Google Maps, AI services)

### Environment
- **OS**: Windows 10
- **Default Shell**: cmd.exe
- **Project Root**: `c:\Users\Lance\Documents\AIDatingWeb`

### Current Project Structure
```
AIDatingWeb/
├── frontend/          # React app (managed by other team member)
├── memory-bank/       # Project documentation
├── .clinerules/       # AI assistant rules
├── .gitignore
└── README.md
```

**NEEDED**: Backend directory structure to be created

## Backend Technology Decisions

### Framework Selection Criteria
**Option 1: Flask**
- Pros: Lightweight, flexible, large ecosystem, simple to start
- Cons: Less built-in features, need to add more dependencies
- Use case: Good for learning, flexible architecture

**Option 2: FastAPI**
- Pros: Modern, async support, automatic API docs, type hints, better performance
- Cons: Newer (smaller community), async paradigm learning curve
- Use case: Better for scalable, production-ready applications

**Recommendation**: FastAPI for its modern features, automatic documentation, and async support

### Database Selection Criteria
**Option 1: PostgreSQL**
- Pros: Robust, ACID compliant, excellent for relational data, JSON support
- Use case: User profiles, matches, messages with relationships

**Option 2: MongoDB**
- Pros: Flexible schema, good for nested documents, horizontal scaling
- Use case: If user profiles have highly variable fields

**Option 3: SQLite**
- Pros: Zero configuration, file-based, good for development
- Use case: Development and testing only

**Recommendation**: PostgreSQL for production, SQLite for initial development

### Authentication Strategy
**JWT (JSON Web Tokens)**
- Pros: Stateless, scalable, works well with REST APIs
- Cons: Can't revoke tokens easily (need blacklist)
- Recommended for: API-based authentication

**Session-Based**
- Pros: Easy to revoke, server controls state
- Cons: Requires server-side storage, harder to scale
- Recommended for: Traditional web apps

**Recommendation**: JWT with refresh tokens for API authentication

## Development Setup (Backend)

### Required Python Packages (Estimated)
```
# Core Framework
fastapi
uvicorn[standard]

# Database
sqlalchemy
psycopg2-binary  # PostgreSQL adapter
alembic  # Database migrations

# Authentication
python-jose[cryptography]  # JWT
passlib[bcrypt]  # Password hashing
python-multipart  # Form data

# External APIs
googlemaps  # Google Maps API client
openai  # or anthropic for AI services
requests

# Utilities
python-dotenv  # Environment variables
pydantic  # Data validation
pydantic-settings
```

### Environment Variables Needed
```
# Database
DATABASE_URL=postgresql://user:password@localhost/aidatingweb

# Authentication
SECRET_KEY=<random-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs
GOOGLE_MAPS_API_KEY=<key>
OPENAI_API_KEY=<key>  # or other AI service

# OAuth (Secondary Feature)
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
```

## API Design Patterns

### RESTful Endpoints Structure
```
/api/v1/
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /refresh
│   └── POST /logout
├── /users
│   ├── GET /me
│   ├── PUT /me
│   └── PUT /me/profile
├── /matches
│   ├── GET /
│   ├── GET /{match_id}
│   └── POST /{match_id}/action
├── /conversations
│   ├── GET /
│   ├── GET /{conversation_id}
│   └── POST /{conversation_id}/messages
├── /dates
│   ├── POST /generate-plan
│   └── GET /plan/{plan_id}
└── /ai
    ├── POST /icebreaker
    └── POST /interpret-message
```

### Response Format Standard
```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "error": null
}
```

## Tool Usage Patterns

### Database Operations
- Use SQLAlchemy ORM for database interactions
- Alembic for schema migrations
- Connection pooling for performance

### API Testing
- Use pytest for unit and integration tests
- Postman or curl for manual API testing
- FastAPI's built-in `/docs` (Swagger UI) for interactive testing

### External API Integration
- Implement service layer for each external API
- Use environment variables for API keys
- Add retry logic and error handling
- Consider rate limiting and caching

## Performance Considerations
- Implement database indexing on frequently queried fields
- Use async operations for I/O-bound tasks (API calls)
- Cache frequently accessed data (user profiles, matches)
- Optimize AI API calls (batch when possible)
- Consider background tasks for non-critical operations

## Security Best Practices
- Hash passwords with bcrypt (never store plain text)
- Validate and sanitize all user inputs
- Use HTTPS in production
- Implement rate limiting on authentication endpoints
- Use prepared statements to prevent SQL injection
- Store API keys in environment variables, never in code
- Implement CORS properly for frontend-backend communication
