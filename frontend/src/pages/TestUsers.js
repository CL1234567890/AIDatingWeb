import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase-config';

const TestUsers = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        
        const allUsers = [];
        querySnapshot.forEach((doc) => {
          // Exclude current user
          if (doc.id !== currentUser.uid) {
            allUsers.push({
              uid: doc.id,
              ...doc.data()
            });
          }
        });
        
        setUsers(allUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleMessage = (userId) => {
    navigate(`/conversations/${userId}`);
  };

  if (loading) {
    return (
      <div className="auth-card">
        <h2>Test Users</h2>
        <p className="subtext">Loading all users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-card">
        <h2>Test Users</h2>
        <div style={{
          padding: 15,
          marginTop: 10,
          borderRadius: 8,
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444'
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>Test Users (Chat Testing)</h2>
      <p className="subtext">
        All registered users. Click "Message" to start a chat.
      </p>

      {users.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: 14
        }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>👥</div>
          <div>No other users registered yet</div>
          <div style={{ marginTop: 8 }}>
            Register more accounts to test chat
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 15 }}>
          {users.map((user) => (
            <div
              key={user.uid}
              style={{
                padding: '14px 16px',
                marginBottom: 10,
                borderRadius: 12,
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <div style={{ 
                  fontWeight: 600,
                  fontSize: 16,
                  color: 'var(--text-primary)',
                  marginBottom: 4
                }}>
                  {user.profile?.name || 'Anonymous User'}
                </div>
                <div style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  marginBottom: 4
                }}>
                  {user.email}
                </div>
                <div style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '4px 6px',
                  borderRadius: 4,
                  display: 'inline-block',
                  wordBreak: 'break-all'
                }}>
                  UID: {user.uid}
                </div>
              </div>

              {user.profile?.interests && user.profile.interests.length > 0 && (
                <div style={{ 
                  marginBottom: 12,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6
                }}>
                  {user.profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 11,
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: 'rgba(236, 72, 153, 0.1)',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="primary-button"
                  onClick={() => handleMessage(user.uid)}
                  style={{ flex: 1 }}
                >
                  💬 Message
                </button>
                <button
                  className="nav-btn nav-ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(user.uid);
                    alert('UID copied to clipboard!');
                  }}
                  style={{ flex: 0, minWidth: 100 }}
                >
                  Copy UID
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: 20,
        padding: 12,
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 8,
        fontSize: 13
      }}>
        <strong>💡 Testing Tip:</strong> Open this page in multiple browsers/windows 
        with different accounts to test real-time chat!
      </div>
    </div>
  );
};

export default TestUsers;
