# Icebreaker Generator API

AI-powered icebreaker generation for personalized conversation starters.

## Overview

The icebreaker generator takes two user identifiers (sender and recipient) and generates personalized conversation starters based on their profiles, interests, and common ground. It uses OpenAI's GPT models to create natural, engaging messages.

## Features

- ✅ **Personalized messages** based on user interests and bio
- ✅ **Common interest detection** to find shared hobbies
- ✅ **Multiple options** - generate up to 5 icebreakers at once
- ✅ **Fallback system** - works even without OpenAI API key
- ✅ **JWT authentication** - secure, user-specific generation
- ✅ **Well-compartmentalized** - separate services for Firebase and AI

## Architecture

```
Request → icebreaker.py (route)
            ↓
            ├→ firebase_service.py (get user profiles)
            └→ ai_service.py (generate icebreaker)
                 ↓
                 → OpenAI API (GPT-3.5-turbo)
```

## API Endpoint

### `POST /api/icebreaker/generate`

Generate personalized icebreaker messages.

**Authentication:** Required (JWT token in `Authorization: Bearer <token>` header)

#### Request Body

```json
{
  "recipient_id": "firebase_uid_of_recipient",
  "count": 3  // Optional: number of icebreakers (1-5, default: 1)
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "icebreakers": [
    "Hey! I noticed you're into rock climbing too. Do you have a favorite spot?",
    "I saw that you love hiking! Have you checked out any trails recently?",
    "Your profile mentioned photography - what kind of shots are you into?"
  ],
  "sender": {
    "uid": "sender_firebase_uid",
    "name": "John",
    "email": "john@example.com"
  },
  "recipient": {
    "uid": "recipient_firebase_uid",
    "name": "Jane",
    "interests": ["hiking", "photography", "rock climbing"]
  },
  "message": "Generated 3 icebreaker(s) successfully"
}
```

#### Error Responses

**400 Bad Request** - Trying to generate icebreaker for yourself
```json
{
  "detail": "Cannot generate icebreaker for yourself"
}
```

**401 Unauthorized** - Invalid or missing JWT token
```json
{
  "detail": "Invalid authentication token"
}
```

**404 Not Found** - User profile doesn't exist
```json
{
  "detail": "Recipient profile not found"
}
```

**500 Internal Server Error** - Generation failed
```json
{
  "detail": "Failed to generate icebreaker: <error message>"
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-...your-key-here
```

**Getting an OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it into your `.env` file

### 3. Set Up Firebase Admin

Download your Firebase service account key:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon) → Service Accounts
4. Click "Generate New Private Key"
5. Save the file as `firebase-service-account.json` in the `backend/` directory

### 4. Start the Server

```bash
cd backend
source dating_venv/bin/activate  # On Windows: dating_venv\Scripts\activate
python main.py
```

Or use uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The server will start at `http://localhost:8000`

### 5. Test the API

Visit the interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Usage Examples

### Using cURL

```bash
# Get your JWT token from Firebase Auth first
TOKEN="your_firebase_jwt_token_here"

# Generate a single icebreaker
curl -X POST http://localhost:8000/api/icebreaker/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id": "recipient_firebase_uid"}'

# Generate multiple icebreakers
curl -X POST http://localhost:8000/api/icebreaker/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id": "recipient_firebase_uid", "count": 3}'
```

### Using JavaScript (Frontend)

```javascript
// Assuming you have Firebase Auth set up
import { auth } from './firebase-config';

async function generateIcebreaker(recipientId, count = 1) {
  // Get the current user's JWT token
  const token = await auth.currentUser.getIdToken();
  
  const response = await fetch('http://localhost:8000/api/icebreaker/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipient_id: recipientId,
      count: count
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Generated icebreakers:', data.icebreakers);
    return data.icebreakers;
  } else {
    throw new Error('Failed to generate icebreaker');
  }
}

// Usage
generateIcebreaker('recipient_uid', 3)
  .then(icebreakers => {
    console.log('Choose one:', icebreakers);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Using Python

```python
import requests

# Get your JWT token from Firebase Auth
token = "your_firebase_jwt_token_here"

response = requests.post(
    "http://localhost:8000/api/icebreaker/generate",
    headers={"Authorization": f"Bearer {token}"},
    json={"recipient_id": "recipient_firebase_uid", "count": 3}
)

data = response.json()
if data["success"]:
    for i, icebreaker in enumerate(data["icebreakers"], 1):
        print(f"{i}. {icebreaker}")
```

## How It Works

### 1. **Profile Fetching** (firebase_service.py)
   - Retrieves sender and recipient profiles from Firestore
   - Extracts interests, bio, name, and other relevant info

### 2. **Prompt Engineering** (ai_service.py)
   - Builds a detailed prompt with both users' information
   - Identifies common interests
   - Includes specific instructions for natural, personalized messages

### 3. **AI Generation** (ai_service.py)
   - Calls OpenAI GPT-3.5-turbo with the prompt
   - Uses temperature=0.8 for creative but coherent outputs
   - Applies frequency/presence penalties to avoid repetition

### 4. **Fallback System**
   - If OpenAI API fails or is unavailable, generates simple but personalized messages
   - Based on common interests or recipient's profile data
   - Ensures the feature always works

## Prompt Template

The AI uses this prompt structure:

```
You are a dating conversation expert helping [SENDER] start a conversation with [RECIPIENT].

RECIPIENT'S PROFILE:
- Name: [name]
- Interests: [interests]
- Bio: [bio]

SENDER'S INTERESTS: [interests]
COMMON INTERESTS: [common interests]

Generate a creative, personalized icebreaker message that:
1. References specific interests or bio details
2. Is warm, genuine, and not overly formal or cheesy
3. Asks an open-ended question
4. Is 2-3 sentences maximum
5. Sounds natural and conversational
6. Shows genuine interest in getting to know them
7. Incorporates common interests if possible

IMPORTANT: Do NOT use generic openers like "Hey, how are you?"
The icebreaker should feel personalized.
```

## Testing

### Test Endpoint

```bash
GET /api/icebreaker/test
Authorization: Bearer <token>
```

Returns a simple success message to verify the endpoint is working.

### Manual Testing Steps

1. **Create test users in Firebase:**
   - User A with interests: ["hiking", "photography", "coffee"]
   - User B with interests: ["hiking", "cooking", "music"]

2. **Log in as User A** and get JWT token

3. **Call the API** with User B's UID

4. **Verify** the icebreaker mentions:
   - User B's name
   - Shared interest (hiking)
   - References to User B's interests

## Cost Considerations

### OpenAI API Costs (GPT-3.5-turbo)
- **Input tokens:** ~$0.0005 per 1K tokens
- **Output tokens:** ~$0.0015 per 1K tokens
- **Average icebreaker request:** ~200 input + 50 output = ~$0.0002 per request
- **100 icebreakers:** ~$0.02
- **1000 icebreakers:** ~$0.20

Very affordable for a hackathon demo! 🎉

## Troubleshooting

### "OpenAI client not initialized"
- Check that `OPENAI_API_KEY` is in your `.env` file
- Verify the API key is valid
- Restart the server after adding the key

### "Firebase Admin SDK not initialized"
- Ensure `firebase-service-account.json` exists in `backend/`
- Check file permissions
- Verify the JSON file is valid

### "Recipient profile not found"
- Verify the recipient user has a profile in Firestore
- Check the `users` collection in Firebase Console
- Ensure the UID is correct

### "Invalid authentication token"
- Get a fresh JWT token from Firebase Auth
- Make sure the token is in the Authorization header
- Format: `Authorization: Bearer <token>`

## Future Enhancements

Potential improvements:
- [ ] Cache generated icebreakers to reduce API costs
- [ ] Add message tone preferences (funny, serious, flirty)
- [ ] Support for different languages
- [ ] Include location-based suggestions
- [ ] A/B test different prompt templates
- [ ] Analytics on which icebreakers get responses

## Files Created

```
backend/
├── app/
│   ├── routes/
│   │   └── icebreaker.py          # API endpoint
│   ├── services/
│   │   ├── firebase_service.py    # Firestore operations
│   │   └── ai_service.py          # OpenAI integration
│   └── utils/
│       └── auth.py                # JWT verification (existing)
├── main.py                        # Router registration
├── .env.example                   # Environment template
└── ICEBREAKER_API.md             # This file
```

## Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review error messages in the console
3. Verify environment variables are set correctly
4. Ensure Firebase and OpenAI services are configured

---

**Happy matching!** 💘
