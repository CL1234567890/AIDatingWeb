import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToConversations } from '../services/chatService';

const ChatList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to conversations on mount
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const unsubscribe = subscribeToConversations(currentUser.uid, (convs) => {
      setConversations(convs);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get other user's info from conversation
  const getOtherUser = (conversation) => {
    if (!conversation.participantDetails) return { name: 'User', email: '' };
    
    const otherUserId = conversation.participants.find(id => id !== currentUser.uid);
    return conversation.participantDetails[otherUserId] || { name: 'User', email: '' };
  };

  // Navigate to conversation
  const openConversation = (conversation) => {
    const otherUserId = conversation.participants.find(id => id !== currentUser.uid);
    navigate(`/conversations/${otherUserId}`);
  };

  if (loading) {
    return (
      <div className="auth-card">
        <h2>Messages</h2>
        <p className="subtext">Loading your conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-card">
        <h2>Messages</h2>
        <div style={{
          padding: 15,
          marginTop: 10,
          borderRadius: 8,
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      <div className="auth-card">
        <h2>Messages</h2>
        <p className="subtext">
          {conversations.length === 0 
            ? 'No conversations yet. Start chatting with your matches!' 
            : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`
          }
        </p>

      {conversations.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: 14
        }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>💬</div>
          <div>No messages yet</div>
          <div style={{ marginTop: 8 }}>
            Visit the Matches page to start a conversation
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/matches')}
            style={{ marginTop: 20 }}
          >
            View Matches
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 15, maxWidth: '100%' }}>
          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const lastMessage = conversation.lastMessage;
            const isUnread = lastMessage && 
                           lastMessage.senderId !== currentUser.uid && 
                           !lastMessage.read;
            
            return (
              <div
                key={conversation.id}
                onClick={() => openConversation(conversation)}
                style={{
                  padding: '12px 15px',
                  marginBottom: 8,
                  borderRadius: 12,
                  background: isUnread 
                    ? 'rgba(236, 72, 153, 0.1)' 
                    : 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(236, 72, 153, 0.15)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isUnread 
                    ? 'rgba(236, 72, 153, 0.1)' 
                    : 'rgba(15, 23, 42, 0.6)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      marginBottom: 4
                    }}>
                      <div style={{
                        fontWeight: isUnread ? 600 : 500,
                        fontSize: 16,
                        color: 'var(--text-primary)',
                        marginRight: 8
                      }}>
                        {otherUser.name}
                      </div>
                      {isUnread && (
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #fb7185, #ec4899)',
                          flexShrink: 0
                        }} />
                      )}
                    </div>
                    
                    {lastMessage && (
                      <div style={{
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: isUnread ? 500 : 400
                      }}>
                        {lastMessage.senderId === currentUser.uid && 'You: '}
                        {lastMessage.text}
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginLeft: 10,
                    flexShrink: 0
                  }}>
                    {formatTimestamp(conversation.updatedAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default ChatList;
