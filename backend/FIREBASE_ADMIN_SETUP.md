# Firebase Admin SDK Setup Instructions

## Step 1: Download Service Account Key

1. **Go to Firebase Console**: https://console.firebase.google.com/

2. **Select your project**: Click on "aidatingweb" project

3. **Go to Project Settings**:
   - Click the gear icon (⚙️) next to "Project Overview" in the left sidebar
   - Select "Project settings"

4. **Navigate to Service Accounts tab**:
   - Click on the "Service accounts" tab at the top

5. **Generate new private key**:
   - Scroll down to "Firebase Admin SDK" section
   - Click the "Generate new private key" button
   - A dialog will appear warning you to keep this key secure
   - Click "Generate key"

6. **Save the downloaded file**:
   - Your browser will download a JSON file (something like `aidatingweb-firebase-adminsdk-xxxxx.json`)
   - **IMPORTANT**: Rename this file to `firebase-service-account.json`
   - Move it to the `backend/` directory of this project
   - Path should be: `/home/yding/Desktop/AIDatingWeb/backend/firebase-service-account.json`

## Step 2: Verify File Location

After downloading, your backend directory should look like this:
```
backend/
├── firebase-service-account.json   <-- NEW FILE HERE
├── main.py
├── requirements.txt
├── app/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
└── dating_venv/
```

## Step 3: Security Check

⚠️ **IMPORTANT SECURITY NOTES**:
- This JSON file contains sensitive credentials
- It's already added to `.gitignore` (should be)
- NEVER commit this file to git
- NEVER share this file publicly
- Keep it secure on your local machine

## Step 4: Verify Setup

Once you have the file in place, I'll initialize Firebase Admin SDK in the backend and create JWT verification middleware.

## What This Enables

With Firebase Admin SDK, the backend can:
- ✅ Verify JWT tokens sent from the frontend
- ✅ Protect API endpoints (require authentication)
- ✅ Access Firestore database from backend
- ✅ Validate user identity for AI features
- ✅ Ensure secure access to matching, date planning, etc.

## Next Steps

After you place the file in `backend/firebase-service-account.json`, let me know and I'll:
1. Initialize Firebase Admin SDK
2. Create JWT verification middleware
3. Protect API endpoints
4. Test authentication flow
