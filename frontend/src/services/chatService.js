import { db, auth } from '../firebase-config';
import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  updateDoc,
  getDocs,
  setDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';

/**
 * Chat Service - Handles all chat-related Firestore operations
 * Uses Firestore real-time listeners for instant message delivery
 */

/**
 * Get or create a conversation between two users
 * @param {string} currentUserId - Current user's UID
 * @param {string} otherUserId - Other user's UID
 * @returns {Promise<{conversationId: string, isNew: boolean}>} - Conversation ID and whether it's new
 */
export const getOrCreateConversation = async (currentUserId, otherUserId) => {
  try {
    // First check for existing conversation (with old random ID system)
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUserId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Check if conversation with both users exists
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      if (data.participants.includes(otherUserId)) {
        return { conversationId: docSnapshot.id, isNew: false };
      }
    }
    
    // No existing conversation found, create new one with deterministic ID
    const sortedIds = [currentUserId, otherUserId].sort();
    const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;
    const conversationRef = doc(db, 'conversations', conversationId);
    
    // Get user details for both participants from profiles collection
    const currentProfileDoc = await getDoc(doc(db, 'profiles', currentUserId));
    const otherProfileDoc = await getDoc(doc(db, 'profiles', otherUserId));
    
    const currentProfileData = currentProfileDoc.data();
    const otherProfileData = otherProfileDoc.data();
    
    // Create new conversation with deterministic ID
    const newConversation = {
      participants: sortedIds,
      participantDetails: {
        [currentUserId]: {
          name: currentProfileData?.name || 'User',
          email: currentProfileData?.email || '',
          photoUrl: currentProfileData?.photos?.[0] || null
        },
        [otherUserId]: {
          name: otherProfileData?.name || 'User',
          email: otherProfileData?.email || '',
          photoUrl: otherProfileData?.photos?.[0] || null
        }
      },
      lastMessage: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Use setDoc with the deterministic ID to prevent duplicates
    await setDoc(conversationRef, newConversation);
    return { conversationId: conversationId, isNew: true };
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    throw error;
  }
};

/**
 * Get message count for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<number>} - Number of messages
 */
export const getMessageCount = async (conversationId) => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const querySnapshot = await getDocs(messagesRef);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting message count:', error);
    return 0;
  }
};

/**
 * Subscribe to messages in a conversation (real-time)
 * @param {string} conversationId - Conversation ID
 * @param {function} callback - Callback function to receive messages
 * @returns {function} - Unsubscribe function
 */
export const subscribeToMessages = (conversationId, callback) => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() // Convert Firestore timestamp to JS Date
        });
      });
      callback(messages);
    }, (error) => {
      console.error('Error subscribing to messages:', error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up message subscription:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} senderId - Sender's UID
 * @param {string} text - Message text
 * @returns {Promise<string>} - Message ID
 */
export const sendMessage = async (conversationId, senderId, text) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Message text cannot be empty');
    }
    
    if (text.length > 1000) {
      throw new Error('Message too long (max 1000 characters)');
    }
    
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    
    // Add new message
    const newMessage = {
      senderId,
      text: text.trim(),
      timestamp: serverTimestamp(),
      read: false,
      type: 'text'
    };
    
    const messageDoc = await addDoc(messagesRef, newMessage);
    
    // Update conversation's lastMessage
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        text: text.trim(),
        senderId,
        timestamp: serverTimestamp(),
        read: false
      },
      updatedAt: serverTimestamp()
    });
    
    return messageDoc.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get all conversations for a user
 * @param {string} userId - User's UID
 * @returns {Promise<Array>} - Array of conversations
 */
export const getUserConversations = async (userId) => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const conversations = [];
    
    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastMessage: {
          ...doc.data().lastMessage,
          timestamp: doc.data().lastMessage?.timestamp?.toDate()
        }
      });
    });
    
    return conversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
};

/**
 * Subscribe to user's conversations (real-time)
 * @param {string} userId - User's UID
 * @param {function} callback - Callback function to receive conversations
 * @returns {function} - Unsubscribe function
 */
export const subscribeToConversations = (userId, callback) => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = [];
      snapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          lastMessage: doc.data().lastMessage ? {
            ...doc.data().lastMessage,
            timestamp: doc.data().lastMessage?.timestamp?.toDate()
          } : null
        });
      });
      callback(conversations);
    }, (error) => {
      console.error('Error subscribing to conversations:', error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up conversations subscription:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Mark messages as read in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - Current user's UID (to mark others' messages as read)
 * @returns {Promise<number>} - Number of messages marked as read
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      where('senderId', '!=', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    let count = 0;
    
    // Update each unread message
    const updatePromises = [];
    querySnapshot.forEach((docSnapshot) => {
      updatePromises.push(updateDoc(doc(db, 'conversations', conversationId, 'messages', docSnapshot.id), {
        read: true
      }));
      count++;
    });
    
    await Promise.all(updatePromises);
    
    // Update conversation's lastMessage read status if needed
    if (count > 0) {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDoc(conversationRef);
      const conversationData = conversationDoc.data();
      
      if (conversationData?.lastMessage?.senderId !== userId) {
        await updateDoc(conversationRef, {
          'lastMessage.read': true
        });
      }
    }
    
    return count;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return 0;
  }
};

export default {
  getOrCreateConversation,
  subscribeToMessages,
  sendMessage,
  getUserConversations,
  subscribeToConversations,
  markMessagesAsRead
};
