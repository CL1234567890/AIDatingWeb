# Parallel Development Plan - AIDatingWeb Hackathon

**Last Updated**: Nov 15, 2025 6:45 PM
**Time Remaining**: ~9-10 hours
**Team Size**: 4 developers

---

## Overview

This document outlines how to parallelize backend development for the AIDatingWeb hackathon project. Frontend and Firebase authentication are already complete. We need to build the Python/FastAPI backend for AI features.

---

## Phase 1: SHARED FOUNDATION (DO THIS FIRST) ⚡

**Assignee**: 1 person (strongest backend developer)
**Time**: 45-60 minutes
**Priority**: CRITICAL - Blocks all other work

### Tasks

1. **Create Backend Structure**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Create requirements.txt**
```txt
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

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Create main.py**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AIDatingWeb API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "AIDatingWeb API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

5. **Download Firebase Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `backend/firebase-service-account.json`
   - Add to .gitignore

6. **Create app/utils/auth.py (JWT Verification)**
```python
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

# Initialize Firebase Admin
cred = credentials.Certificate("./firebase-service-account.json")
firebase_admin.initialize_app(cred)

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify Firebase JWT token"""
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication: {str(e)}")
```

7. **Create .env file**
```bash
GOOGLE_MAPS_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
FRONTEND_URL=http://localhost:3000
```

8. **Test Server**
```bash
uvicorn main:app --reload --port 8000
# Visit http://localhost:8000/docs for auto-generated API documentation
# Test http://localhost:8000/api/health
```

### Completion Criteria
- ✅ Server runs on port 8000
- ✅ /api/health returns 200
- ✅ CORS allows requests from localhost:3000
- ✅ Firebase Admin SDK initialized
- ✅ verify_token() function works

---

## Phase 2: PARALLEL WORKSTREAMS (After Foundation)

Once Phase 1 is complete, all team members can work simultaneously on different features.

---

## WORKSTREAM A: Matching Algorithm 🎯

**Assignee**: Team Member A
**Time**: 2 hours
**Files**: `backend/app/routes/matches.py`, `backend/app/services/matching_service.py`

### Implementation Guide

1. **Create app/services/matching_service.py**
```python
from firebase_admin import firestore
from typing import List, Dict

db = firestore.client()

class MatchingService:
    def calculate_match_score(self, user1: Dict, user2: Dict) -> float:
        """Calculate match score between two users"""
        score = 0.0
        
        # Interest overlap (40% weight)
        interests1 = set(user1.get('profile', {}).get('interests', []))
        interests2 = set(user2.get('profile', {}).get('interests', []))
        if interests1 and interests2:
            overlap = len(interests1 & interests2) / len(interests1 | interests2)
            score += overlap * 40
        
        # Age compatibility (30% weight)
        age1 = user1.get('profile', {}).get('age')
        age2 = user2.get('profile', {}).get('age')
        if age1 and age2:
            age_diff = abs(age1 - age2)
            age_score = max(0, 1 - (age_diff / 20))  # 20 year max diff
            score += age_score * 30
        
        # TODO: Location distance (20% weight) - if locations available
        # TODO: Recent activity (10% weight) - check lastActive timestamp
        
        return score
    
    async def get_match_suggestions(self, current_user_id: str, limit: int = 10) -> List[Dict]:
        """Get match suggestions for a user"""
        # Get current user
        current_user_ref = db.collection('users').document(current_user_id)
        current_user = current_user_ref.get().to_dict()
        
        # Get all other users
        users_ref = db.collection('users')
        all_users = users_ref.stream()
        
        matches = []
        for user_doc in all_users:
            if user_doc.id == current_user_id:
                continue
            
            user_data = user_doc.to_dict()
            score = self.calculate_match_score(current_user, user_data)
            
            matches.append({
                "uid": user_doc.id,
                "profile": user_data.get('profile', {}),
                "matchScore": round(score, 2)
            })
        
        # Sort by score and return top N
        matches.sort(key=lambda x: x['matchScore'], reverse=True)
        return matches[:limit]
```

2. **Create app/routes/matches.py**
```python
from fastapi import APIRouter, Depends
from app.utils.auth import verify_token
from app.services.matching_service import MatchingService

router = APIRouter(prefix="/api/matches", tags=["matches"])
matching_service = MatchingService()

@router.post("/suggestions")
async def get_match_suggestions(
    limit: int = 10,
    current_user: dict = Depends(verify_token)
):
    """Get AI-powered match suggestions"""
    user_id = current_user['uid']
    matches = await matching_service.get_match_suggestions(user_id, limit)
    return {"matches": matches}
```

3. **Register Router in main.py**
```python
from app.routes import matches
app.include_router(matches.router)
```

### Testing
```bash
curl -X POST http://localhost:8000/api/matches/suggestions \
  -H "Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## WORKSTREAM B: Date Planning (Google Maps) 🗺️

**Assignee**: Team Member B
**Time**: 3 hours (longest workstream)
**Files**: `backend/app/routes/date_planning.py`, `backend/app/services/maps_service.py`

### Prerequisites
- Obtain Google Maps API key
- Enable Places API and Routes API in Google Cloud Console

### Implementation Guide

1. **Create app/services/maps_service.py**
```python
import googlemaps
import os
from typing import List, Dict

class MapsService:
    def __init__(self):
        self.gmaps = googlemaps.Client(key=os.getenv('GOOGLE_MAPS_API_KEY'))
    
    def get_vibe_keywords(self, vibe: str) -> List[str]:
        """Map vibe to search keywords"""
        vibe_map = {
            "romantic": ["romantic restaurant", "scenic viewpoint", "wine bar", "rooftop bar"],
            "adventurous": ["hiking trail", "rock climbing", "adventure park", "water sports"],
            "chill": ["coffee shop", "bookstore", "park", "museum", "art gallery"],
            "foodie": ["restaurant", "food market", "brewery", "dessert shop"],
            "cultural": ["museum", "theater", "art gallery", "historical site"]
        }
        return vibe_map.get(vibe.lower(), ["restaurant", "cafe", "park"])
    
    async def find_places(self, location: Dict, vibe: str, radius: int = 5000) -> List[Dict]:
        """Find places based on vibe and location"""
        lat = location.get('lat')
        lng = location.get('lng')
        
        keywords = self.get_vibe_keywords(vibe)
        all_places = []
        
        for keyword in keywords:
            try:
                results = self.gmaps.places_nearby(
                    location=(lat, lng),
                    radius=radius,
                    keyword=keyword,
                    open_now=True
                )
                
                for place in results.get('results', [])[:3]:  # Top 3 per keyword
                    all_places.append({
                        "name": place.get('name'),
                        "address": place.get('vicinity'),
                        "rating": place.get('rating', 0),
                        "location": place.get('geometry', {}).get('location', {}),
                        "place_id": place.get('place_id'),
                        "types": place.get('types', [])
                    })
            except Exception as e:
                print(f"Error finding places for {keyword}: {e}")
        
        # Sort by rating
        all_places.sort(key=lambda x: x['rating'], reverse=True)
        return all_places[:5]  # Top 5 overall
    
    async def create_route(self, places: List[Dict]) -> Dict:
        """Create optimal route between places"""
        if not places or len(places) < 2:
            return {}
        
        waypoints = [f"{p['location']['lat']},{p['location']['lng']}" for p in places[1:-1]]
        origin = f"{places[0]['location']['lat']},{places[0]['location']['lng']}"
        destination = f"{places[-1]['location']['lat']},{places[-1]['location']['lng']}"
        
        try:
            directions = self.gmaps.directions(
                origin=origin,
                destination=destination,
                waypoints=waypoints,
                mode="driving",
                optimize_waypoints=True
            )
            
            if directions:
                route = directions[0]
                return {
                    "duration": route['legs'][0]['duration']['text'],
                    "distance": route['legs'][0]['distance']['text'],
                    "polyline": route['overview_polyline']['points']
                }
        except Exception as e:
            print(f"Error creating route: {e}")
        
        return {}
```

2. **Create app/routes/date_planning.py**
```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict
from app.utils.auth import verify_token
from app.services.maps_service import MapsService

router = APIRouter(prefix="/api/ai", tags=["ai"])
maps_service = MapsService()

class DatePlanRequest(BaseModel):
    vibe: str
    location: Dict[str, float]  # {"lat": 37.7749, "lng": -122.4194}
    radius: int = 5000  # meters

@router.post("/date-plan")
async def generate_date_plan(
    request: DatePlanRequest,
    current_user: dict = Depends(verify_token)
):
    """Generate AI-powered date plan with Google Maps"""
    places = await maps_service.find_places(
        location=request.location,
        vibe=request.vibe,
        radius=request.radius
    )
    
    route = await maps_service.create_route(places) if len(places) >= 2 else {}
    
    return {
        "vibe": request.vibe,
        "places": places,
        "route": route,
        "itinerary": [
            {
                "order": i + 1,
                "place": place['name'],
                "address": place['address'],
                "rating": place['rating']
            }
            for i, place in enumerate(places)
        ]
    }
```

3. **Register Router in main.py**
```python
from app.routes import date_planning
app.include_router(date_planning.router)
```

### Testing
```bash
curl -X POST http://localhost:8000/api/ai/date-plan \
  -H "Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vibe": "romantic",
    "location": {"lat": 37.7749, "lng": -122.4194},
    "radius": 5000
  }'
```

---

## WORKSTREAM C: AI Icebreaker Generator 💬

**Assignee**: Team Member C
**Time**: 1 hour
**Files**: `backend/app/routes/icebreaker.py`, `backend/app/services/ai_service.py`

### Prerequisites
- Obtain OpenAI API key

### Implementation Guide

1. **Create app/services/ai_service.py**
```python
import openai
import os
from typing import Dict

openai.api_key = os.getenv('OPENAI_API_KEY')

class AIService:
    async def generate_icebreaker(self, match_profile: Dict) -> str:
        """Generate personalized icebreaker"""
        name = match_profile.get('name', 'this person')
        interests = match_profile.get('interests', [])
        bio = match_profile.get('bio', '')
        
        prompt = f"""Generate a creative, personalized icebreaker message for a dating app.

Match Profile:
- Name: {name}
- Interests: {', '.join(interests)}
- Bio: {bio}

Requirements:
- Be friendly and genuine
- Reference their interests or bio
- Keep it under 100 words
- Avoid generic openers like "Hey" or "What's up"
- Make it conversation-starting

Generate just the icebreaker message, nothing else:"""

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a creative dating coach helping people start conversations."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.8
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"I noticed you're into {interests[0] if interests else 'interesting things'}! What got you started with that?"
```

2. **Create app/routes/icebreaker.py**
```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict
from app.utils.auth import verify_token
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/ai", tags=["ai"])
ai_service = AIService()

class IcebreakerRequest(BaseModel):
    match_profile: Dict

@router.post("/icebreaker")
async def generate_icebreaker(
    request: IcebreakerRequest,
    current_user: dict = Depends(verify_token)
):
    """Generate AI-powered icebreaker"""
    icebreaker = await ai_service.generate_icebreaker(request.match_profile)
    return {"icebreaker": icebreaker}
```

3. **Register Router in main.py**
```python
from app.routes import icebreaker
app.include_router(icebreaker.router)
```

### Testing
```bash
curl -X POST http://localhost:8000/api/ai/icebreaker \
  -H "Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "match_profile": {
      "name": "Sarah",
      "interests": ["hiking", "photography", "coffee"],
      "bio": "Weekend adventurer and coffee enthusiast"
    }
  }'
```

---

## WORKSTREAM D: Frontend Integration + Messaging UI 💻

**Assignee**: Team Member D
**Time**: 2-3 hours
**Files**: Frontend pages and API service

### Part 1: Messaging UI (No Backend Needed)

1. **Update frontend/src/pages/Chat.js**
```javascript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../contexts/AuthContext';

const Chat = () => {
  const { id: conversationId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Real-time message listener
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={msg.senderId === currentUser.uid ? 'message-sent' : 'message-received'}
          >
            {msg.text}
          </div>
        ))}
      </div>
      
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
};

export default Chat;
```

### Part 2: API Service Layer

2. **Create frontend/src/services/api.js**
```javascript
import { auth } from '../firebase-config';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

async function getAuthHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const api = {
  async fetchMatchSuggestions(limit = 10) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/matches/suggestions?limit=${limit}`, {
      method: 'POST',
      headers
    });
    
    if (!response.ok) throw new Error('Failed to fetch matches');
    return response.json();
  },

  async generateDatePlan(vibe, location, radius = 5000) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/ai/date-plan`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ vibe, location, radius })
    });
    
    if (!response.ok) throw new Error('Failed to generate date plan');
    return response.json();
  },

  async generateIcebreaker(matchProfile) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/ai/icebreaker`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ match_profile: matchProfile })
    });
    
    if (!response.ok) throw new Error('Failed to generate icebreaker');
    return response.json();
  }
};
```

3. **Update frontend/src/pages/Matches.js**
```javascript
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await api.fetchMatchSuggestions(10);
      setMatches(data.matches);
    } catch (err) {
      setError('Failed to load matches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading matches...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="matches-container">
      <h2>Your AI-Curated Matches</h2>
      <div className="matches-grid">
        {matches.map(match => (
          <div key={match.uid} className="match-card">
            <h3>{match.profile.name}</h3>
            <p>Match Score: {match.matchScore}%</p>
            <p>Interests: {match.profile.interests?.join(', ')}</p>
            <button>Connect</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;
```

4. **Update frontend/src/pages/DatePlannar.js**
```javascript
import React, { useState } from 'react';
import { api } from '../services/api';

const DatePlanner = () => {
  const [vibe, setVibe] = useState('romantic');
  const [datePlan, setDatePlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePlan = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get user's location (simplified - use browser geolocation in production)
      const location = { lat: 37.7749, lng: -122.4194 }; // San Francisco default
      
      const plan = await api.generateDatePlan(vibe, location, 5000);
      setDatePlan(plan);
    } catch (err) {
      setError('Failed to generate date plan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="date-planner-container">
      <h2>AI Date Planner</h2>
      
      <div className="vibe-selector">
        <label>Choose your vibe:</label>
        <select value={vibe} onChange={(e) => setVibe(e.target.value)}>
          <option value="romantic">Romantic</option>
          <option value="adventurous">Adventurous</option>
          <option value="chill">Chill</option>
          <option value="foodie">Foodie</option>
          <option value="cultural">Cultural</option>
        </select>
      </div>
      
      <button onClick={generatePlan} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Date Plan'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {datePlan && (
        <div className="date-plan">
          <h3>Your {datePlan.vibe} Date Itinerary</h3>
          {datePlan.itinerary.map((stop, i) => (
            <div key={i} className="itinerary-stop">
              <strong>Stop {stop.order}:</strong> {stop.place}
              <br />
              <small>{stop.address} - Rating: {stop.rating}⭐</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatePlanner;
```

5. **Create frontend/.env**
```bash
REACT_APP_API_URL=http://localhost:8000
```

---

## Phase 3: Integration & Testing

**Time**: 1-2 hours
**All Team Members**

### Checklist

- [ ] All endpoints return 200 status
- [ ] Frontend can call backend APIs
- [ ] CORS working correctly
- [ ] JWT verification working
- [ ] Create test users in Firestore
- [ ] Test matching algorithm with real data
- [ ] Test date planning with different vibes
- [ ] Test icebreaker generation
- [ ] Test real-time messaging
- [ ] Fix any bugs
- [ ] Prepare demo data

### Testing Commands

```bash
# Test health
curl http://localhost:8000/api/health

# Test API docs
open http://localhost:8000/docs

# Test with frontend
cd frontend && npm start
# Navigate to http://localhost:3000
```

---

## API Keys Checklist

- [ ] Google Maps API Key (enable Places + Routes APIs)
- [ ] OpenAI API Key
- [ ] Firebase Service Account JSON

---

## Timeline Summary

| Phase | Time | Type |
|-------|------|------|
| Phase 1: Foundation | 45-60 min | Sequential |
| Phase 2A: Matching | 2 hours | Parallel |
| Phase 2B: Date Planning | 3 hours | Parallel |
| Phase 2C: Icebreaker | 1 hour | Parallel |
| Phase 2D: Frontend | 2-3 hours | Parallel |
| Phase 3: Integration | 1-2 hours | Together |
| **Total** | **8-10 hours** | **Wall clock: 4-5 hours** |

---

## Git Workflow

1. Foundation developer creates `backend-foundation` branch
2. After foundation complete, each workstream creates feature branch:
   - `feature/matching-algorithm`
   - `feature/date-planning`
   - `feature/icebreaker`
   - `feature/frontend-integration`
3. Merge to `main` during integration phase
4. Test thoroughly before demo

---

## Questions?

Contact the team lead or refer to Memory Bank documentation in `/memory-bank/` directory.

Good luck! 🚀
