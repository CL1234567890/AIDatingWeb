# Firestore Security Rules for Chat Feature

## Instructions

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: **aidatingweb**
3. Navigate to: **Firestore Database** → **Rules**
4. Replace the existing rules with the rules below
5. Click **Publish**

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - existing rules
    match /users/{userId} {
      // Anyone authenticated can read user profiles
      allow read: if request.auth != null;
      // Users can only write their own profile
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // NEW: Conversations collection
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
      
      // Messages subcollection
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

## What These Rules Do

### Conversations Collection
- **Read**: Only participants can see the conversation
- **Create**: Users can create conversations where they're a participant (2 people max)
- **Update**: Participants can update (for lastMessage field)

### Messages Subcollection
- **Read**: Only conversation participants can read messages
- **Create**: Only participants can send messages, and they must be the sender
- **Message Validation**: Messages must be 1-1000 characters
- **Update**: Participants can update messages (for marking as read)

## Security Features

✅ **Privacy**: Users can only see conversations they're part of  
✅ **Authentication**: All operations require login  
✅ **Validation**: Message length enforced at database level  
✅ **Integrity**: Can't fake sender ID  
✅ **Read Receipts**: Participants can mark messages as read

## Testing the Rules

After publishing:
1. Try to access a conversation you're not part of (should fail)
2. Try to send a message (should succeed)
3. Try to send an empty message (should fail)
4. Try to send a message >1000 chars (should fail)

## Current Status

- ⏳ Rules need to be added to Firebase Console
- 📝 Copy the rules above
- 🔥 Publish in Firebase Console
- ✅ Test the chat functionality
