# Icebreaker Generator - Quick Start

## What Was Built

A fully functional icebreaker generator API that:
- Takes two user IDs (sender and recipient)
- Fetches their profiles from Firebase
- Generates personalized conversation starters using OpenAI
- Returns 1-5 icebreaker options

## Files Created

```
backend/app/
├── services/
│   ├── firebase_service.py    ← Firestore operations (get user profiles)
│   └── ai_service.py          ← OpenAI integration + prompt engineering
└── routes/
    └── icebreaker.py          ← API endpoint + request validation
```

## API Endpoint

**POST** `/api/icebreaker/generate`

**Request:**
```json
{
  "recipient_id": "firebase_uid",
  "count": 3  // optional, 1-5
}
```

**Response:**
```json
{
  "success": true,
  "icebreakers": [
    "Hey! I noticed you're into hiking too. What's your favorite trail?",
    "I saw photography in your interests - what do you like to shoot?",
    "Your profile mentioned coffee - any favorite spots?"
  ],
  "sender": { "uid": "...", "name": "John" },
  "recipient": { "uid": "...", "name": "Jane", "interests": [...] }
}
```

## Setup (3 Steps)

### 1. Get OpenAI API Key
- Go to https://platform.openai.com/api-keys
- Create account / sign in
- Click "Create new secret key"
- Copy the key

### 2. Create `.env` file
```bash
cd backend
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-proj-your-key-here
```

### 3. Test it!
```bash
# Backend should already be running
# Visit: http://localhost:8000/docs
# Find POST /api/icebreaker/generate
# Click "Try it out"
# Enter recipient_id and execute
```

## How to Use from Frontend

```javascript
import { auth } from './firebase-config';

async function generateIcebreaker(recipientId) {
  const token = await auth.currentUser.getIdToken();
  
  const response = await fetch('http://localhost:8000/api/icebreaker/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ recipient_id: recipientId, count: 3 })
  });
  
  const data = await response.json();
  return data.icebreakers; // Array of 3 icebreaker messages
}
```

## Key Features

✅ **Smart & Personalized** - Uses both users' profiles, finds common interests
✅ **Multiple Options** - Generate 1-5 icebreakers at once
✅ **Fallback System** - Works even without OpenAI (uses interests directly)
✅ **Secure** - Requires JWT authentication
✅ **Well-Architected** - Clean separation: routes → services → APIs

## Prompt Engineering

The AI receives:
- Both users' names, interests, and bios
- Common interests between them
- Instructions to be natural, warm, and specific
- Rules against generic openers

Result: Natural, personalized messages that show genuine interest!

## Cost

Super cheap for hackathon:
- ~$0.0002 per icebreaker
- 100 icebreakers = $0.02
- 1000 icebreakers = $0.20

## Troubleshooting

**"OpenAI client not initialized"**
→ Add OPENAI_API_KEY to backend/.env and restart server

**"Recipient profile not found"**
→ Make sure the user exists in Firestore users collection

**"Invalid authentication token"**
→ Get fresh token: `await auth.currentUser.getIdToken()`

## Next Steps

1. Add OpenAI API key to `.env`
2. Test the endpoint at `/docs`
3. Integrate into frontend (Chat or Matches page)
4. Create UI for showing multiple icebreaker options
5. Add a "copy to clipboard" or "send" button

See `ICEBREAKER_API.md` for full documentation!
