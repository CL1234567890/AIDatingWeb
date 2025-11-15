# System Patterns

## Architecture Overview
AIDatingWeb follows a **client-server architecture** with a clear separation between frontend and backend:

```
┌─────────────────────┐
│   React Frontend    │
│   (Port 3000)       │
└──────────┬──────────┘
           │
           │ HTTP/REST API
           │
┌──────────▼──────────┐
│   Python Backend    │
│   (TBD Port)        │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐   ┌────▼─────┐
│  DB   │   │ External │
│ (TBD) │   │   APIs   │
└───────┘   └──────────┘
              - Google Maps
              - AI Services
```

## Frontend Architecture

### Component Structure
```
src/
├── components/        # Reusable UI components
│   └── Navbar.js     # Navigation component
├── pages/            # Route-level page components
│   ├── Login.js      # Login page with form
│   └── Register.js   # Registration page with form
├── App.js            # Main app with routing
└── index.js          # React entry point
```

### Routing Pattern
- Uses **React Router DOM v7** for client-side routing
- Route definitions centralized in App.js
- Page components are lazy-loaded candidates for future optimization

### State Management
- **Current**: Local component state with `useState`
- **Future**: Will need global state management (Context API or Redux) for:
  - User authentication state
  - User profile data
  - Match data
  - Real-time messaging state

### API Integration Pattern
- Frontend will call backend REST APIs
- TODO: Implement API service layer (e.g., `src/services/api.js`)
- TODO: Add authentication token management (JWT or session)
- TODO: Add error handling and loading states

## Backend Architecture (To Be Implemented)

### Expected Structure
```
backend/
├── app/
│   ├── routes/          # API endpoints
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   │   ├── auth.py      # Authentication service
│   │   ├── matching.py  # AI matching algorithm
│   │   ├── maps.py      # Google Maps integration
│   │   └── ai.py        # AI services (icebreaker, interpreter)
│   └── utils/           # Helper functions
├── config/              # Configuration
└── main.py              # Application entry point
```

### Backend Framework
- **Expected**: Flask or FastAPI
- RESTful API design
- JWT-based authentication (planned)

## Key Design Patterns

### 1. Component Composition (Frontend)
- Reusable UI components (Navbar, forms, buttons)
- Page components compose smaller components
- Consistent styling through CSS classes

### 2. Form Handling Pattern
Current implementation in Login/Register:
```javascript
const [field, setField] = useState("");

const handleSubmit = (e) => {
  e.preventDefault();
  // Validation
  // API call (TODO)
};
```

### 3. Authentication Flow (Planned)
```
Login/Register → Backend Auth → JWT Token → 
Store in localStorage/cookie → Include in API headers
```

### 4. API Service Layer (To Be Implemented)
Centralized API calls:
```javascript
// services/api.js
export const login = (email, password) => {...}
export const register = (userData) => {...}
export const getMatches = () => {...}
```

## Critical Implementation Paths

### 1. Authentication Flow
```
User Input → Frontend Validation → Backend API → 
Database Check → Token Generation → Frontend Storage → 
Protected Routes Access
```

### 2. Matching System
```
User Profile Data → AI Matching Algorithm → 
Compatibility Scoring → Location Filtering → 
Return Curated Matches
```

### 3. Date Map Feature
```
User Input (Current Vibe/Preferences) → Backend Service → 
Google Maps API → Location Search → AI Filtering → 
Route Optimization → Return Personalized Itinerary
```

### 4. Real-time Messaging
```
WebSocket Connection → Message Send → 
Backend Relay → Recipient Connection → 
Message Delivery → Read Receipts
```

## Component Relationships

### Current Structure
- **App.js** → Controls routing, contains Navbar and page rendering
- **Navbar** → Persistent navigation across all pages
- **Login/Register** → Independent page components, link to each other
- All components share global CSS (App.css, index.css)

### Future Dependencies
- Protected routes will need authentication context
- Profile pages will consume user data from API
- Match pages will need real-time updates
- Chat interface will require WebSocket connection

## Data Flow Patterns

### Current (Frontend Only)
```
User Input → Local State → Console Log (placeholder)
```

### Target (Full Stack)
```
User Input → Local State → API Service → 
Backend Logic → Database → Response → 
State Update → UI Re-render
```

## Security Considerations
- Password validation on both frontend and backend
- HTTPS for all API communications
- JWT token expiration and refresh
- Input sanitization to prevent injection attacks
- Rate limiting on authentication endpoints
- OAuth implementation for trusted third-party auth

## Scalability Patterns
- Stateless backend services for horizontal scaling
- Database connection pooling
- Caching layer for frequently accessed data (matches, profiles)
- CDN for static assets
- WebSocket server separation for messaging
- API versioning for backward compatibility
