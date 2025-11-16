import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import '../App.css';

function TestIcebreaker() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState(null);
  const [icebreakers, setIcebreakers] = useState({});
  const [error, setError] = useState('');

  // Fetch all users from Firestore
  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        const usersList = [];
        snapshot.forEach(doc => {
          const userData = doc.data();
          if (doc.id !== currentUser?.uid) { // Exclude current user
            usersList.push({
              uid: doc.id,
              ...userData
            });
          }
        });
        
        setUsers(usersList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  // Generate icebreaker
  async function generateIcebreaker(recipientId, count = 3) {
    setGeneratingFor(recipientId);
    setError('');

    try {
      // Get JWT token
      const token = await currentUser.getIdToken();

      // Call backend API
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
        setIcebreakers(prev => ({
          ...prev,
          [recipientId]: data.icebreakers
        }));
      } else {
        setError(data.detail || 'Failed to generate icebreaker');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate icebreaker: ' + err.message);
    } finally {
      setGeneratingFor(null);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Icebreaker Generator Test</h1>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#000' }}>🧊 Icebreaker Generator Test</h1>
      <p style={{ color: '#333', marginBottom: '30px', fontSize: '16px' }}>
        Test the AI-powered icebreaker feature. Click "Generate" next to any user to create personalized conversation starters.
      </p>

      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          ❌ {error}
        </div>
      )}

      {users.length === 0 ? (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>No other users found</h3>
          <p>Create more test users in Firebase to test the icebreaker feature!</p>
        </div>
      ) : (
        <div>
          <h2>Available Users ({users.length})</h2>
          
          {users.map(user => (
            <div 
              key={user.uid}
              style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                backgroundColor: '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#000' }}>
                    {user.profile?.name || 'Unnamed User'}
                  </h3>
                  
                  <p style={{ color: '#333', fontSize: '14px', margin: '5px 0' }}>
                    <strong>Email:</strong> {user.email || 'N/A'}
                  </p>
                  
                  {user.profile?.interests && user.profile.interests.length > 0 && (
                    <p style={{ color: '#333', fontSize: '14px', margin: '5px 0' }}>
                      <strong>Interests:</strong> {user.profile.interests.join(', ')}
                    </p>
                  )}
                  
                  {user.profile?.bio && (
                    <p style={{ color: '#444', fontSize: '14px', margin: '5px 0', fontStyle: 'italic' }}>
                      "{user.profile.bio}"
                    </p>
                  )}
                  
                  <p style={{ color: '#666', fontSize: '12px', margin: '10px 0 0 0' }}>
                    UID: {user.uid}
                  </p>
                </div>
                
                <button
                  onClick={() => generateIcebreaker(user.uid, 3)}
                  disabled={generatingFor === user.uid}
                  style={{
                    backgroundColor: generatingFor === user.uid ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: generatingFor === user.uid ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    minWidth: '120px'
                  }}
                >
                  {generatingFor === user.uid ? '⏳ Generating...' : '✨ Generate'}
                </button>
              </div>

              {/* Display generated icebreakers */}
              {icebreakers[user.uid] && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: '#e8f5e9',
                  borderRadius: '8px',
                  borderLeft: '4px solid #4caf50'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>
                    💬 Generated Icebreakers:
                  </h4>
                  {icebreakers[user.uid].map((icebreaker, index) => (
                    <div 
                      key={index}
                      style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: index < icebreakers[user.uid].length - 1 ? '10px' : '0',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}
                    >
                      <strong>{index + 1}.</strong> {icebreaker}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>ℹ️ How it works:</h3>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>The AI analyzes both your profile and the recipient's profile</li>
          <li>It identifies common interests and unique details</li>
          <li>Generates personalized, natural conversation starters</li>
          <li>Creates 3 different options for variety</li>
        </ol>
        <p style={{ margin: '10px 0 0 0', color: '#666' }}>
          <strong>Note:</strong> Make sure you have set up your OpenAI API key in the backend .env file!
        </p>
      </div>
    </div>
  );
}

export default TestIcebreaker;
