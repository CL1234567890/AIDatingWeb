/**
 * API Service
 * Handles all backend API calls with authentication
 */
import { auth } from '../firebase-config';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Get authentication token from Firebase
 */
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

/**
 * Make authenticated API request
 */
async function authenticatedFetch(endpoint, options = {}) {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Generate personalized icebreakers for a match
 * 
 * @param {string} recipientId - Firebase UID of the person to message
 * @param {number} count - Number of icebreakers to generate (default: 3)
 * @returns {Promise<string[]>} Array of icebreaker messages
 */
export async function generateIcebreakers(recipientId, count = 3) {
  try {
    const data = await authenticatedFetch('/api/icebreaker/generate', {
      method: 'POST',
      body: JSON.stringify({
        recipient_id: recipientId,
        count: count,
      }),
    });
    
    return data.icebreakers || [];
  } catch (error) {
    console.error('Error generating icebreakers:', error);
    // Return fallback icebreakers if API fails
    return [
      "Hey! Your profile caught my attention. What do you like to do for fun?",
      "Hi there! I'd love to get to know you better. What's your favorite way to spend a weekend?",
      "Hello! I noticed we might have some things in common. What are you passionate about?"
    ];
  }
}

/**
 * Health check - test if backend is responding
 */
export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return await response.json();
  } catch (error) {
    console.error('Backend health check failed:', error);
    return { status: 'offline', error: error.message };
  }
}

/**
 * Test authentication with backend
 */
export async function testAuth() {
  try {
    const data = await authenticatedFetch('/api/auth/test');
    return data;
  } catch (error) {
    console.error('Auth test failed:', error);
    throw error;
  }
}

// Export API base URL for other services
export { API_BASE_URL };
