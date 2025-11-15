# Firebase Setup - What YOU Need to Do

## 🔥 Quick Firebase Setup (15 minutes)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name: `ai-dating-app`
4. Disable Google Analytics (not needed)
5. Click "Create project"

### Step 2: Register Web App
1. Click the Web icon `</>` 
2. App nickname: `AI Dating Web`
3. Click "Register app"
4. **COPY the firebaseConfig object** - you'll need it!
5. Click "Continue to console"

### Step 3: Enable Email/Password Authentication
1. Left sidebar → "Authentication" → "Get started"
2. Click "Sign-in method" tab
3. Click "Email/Password"
4. Toggle "Enable" → Save

### Step 4: Create Firestore Database
1. Left sidebar → "Firestore Database" → "Create database"
2. Select "Start in production mode" → Next
3. Choose location (us-central1) → Enable
4. Wait ~1 minute for creation

### Step 5: Set Firestore Security Rules
Click "Rules" tab and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /matches/{matchId} {
      allow read, write: if request.auth != null;
    }
    
    match /conversations/{convId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

Click "Publish"

### Step 6: Configure Your App

Create `frontend/.env` file with YOUR Firebase config (from Step 2):

```env
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Step 7: Install Dependencies

```bash
cd frontend
npm install firebase
```

### ✅ Done! 

After this, your existing Login and Register pages will work with Firebase!

## What I'm Doing

I'll update your existing Login.js and Register.js to:
- ✅ Use Firebase Authentication
- ✅ Store user profiles in Firestore
- ✅ Keep your existing UI exactly as is
- ✅ Add error handling and loading states

No changes to your UI - just the backend integration!
