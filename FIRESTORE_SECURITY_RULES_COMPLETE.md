# Complete Firestore Security Rules (Merged)

## Replace ALL existing rules with this complete version

Copy everything below and paste into Firebase Console → Firestore → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - existing rules (kept as is)
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Matches collection - existing rules (kept as is)
    match /matches/{matchId} {
      allow read, write: if request.auth != null;
    }
    
    // UPDATED: Conversations collection - MORE SECURE VERSION
    match /conversations/{conversationId} {
      // Can read if you're a participant in the conversation
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      // Can create if you're adding yourself as a participant
      // and the conversation has exactly 2 participants
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants &&
        request.resource.data.participants.size() == 2;
      
      // Can update if you're a participant (for lastMessage updates)
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      // Messages subcollection - MORE SECURE VERSION
      match /messages/{messageId} {
        // Can read messages if you're in the conversation
        allow read: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        
        // Can create messages if:
        // 1. You're in the conversation
        // 2. You're the sender
        // 3. Message text is between 1-1000 characters
        allow create: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants &&
          request.auth.uid == request.resource.data.senderId &&
          request.resource.data.text.size() > 0 &&
          request.resource.data.text.size() <= 1000;
        
        // Can update messages (for read receipts)
        allow update: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }
  }
}
```

## What Changed from Your Existing Rules

### Kept the Same:
- ✅ `users` collection rules (unchanged)
- ✅ `matches` collection rules (unchanged)

### Improved for Security:
- 🔒 **Conversations:** Now validates participant count (must be exactly 2)
- 🔒 **Messages create:** Now requires you to be the sender (prevents spoofing)
- 🔒 **Messages create:** Now validates message length (1-1000 chars)
- 🔒 **Messages:** Separated create/update permissions for better control

### Why These Changes Matter:

**Your old rules:**
```javascript
match /conversations/{convId} {
  allow read, write: if request.auth != null && 
    request.auth.uid in resource.data.participants;
}
```
- ❌ Allows anyone to create conversations with any participants
- ❌ No validation on conversation structure
- ❌ Too permissive

**New rules:**
```javascript
allow create: if request.auth != null && 
  request.auth.uid in request.resource.data.participants &&
  request.resource.data.participants.size() == 2;
```
- ✅ You can only create conversations where YOU are a participant
- ✅ Enforces exactly 2 participants per conversation
- ✅ More secure and prevents abuse

## How to Apply

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: **aidatingweb**
3. Navigate to: **Firestore Database** → **Rules**
4. **Delete everything** in the rules editor
5. Copy the complete rules above
6. Paste into the editor
7. Click **Publish**

## Test After Publishing

The chat should work exactly the same, but now with better security! 🔒
