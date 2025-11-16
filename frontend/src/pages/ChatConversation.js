import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getOrCreateConversation, 
  subscribeToMessages, 
  sendMessage,
  markMessagesAsRead,
  getMessageCount
} from '../services/chatService';
import IcebreakerSelector from '../components/IcebreakerSelector';

const ChatConversation = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [otherUserName, setOtherUserName] = useState('Loading...');
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch other user's profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(`http://localhost:8000/api/user/profile/${matchId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOtherUserName(data.name || 'User');
        } else {
          setOtherUserName('User');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setOtherUserName('User');
      }
    };

    if (currentUser && matchId) {
      fetchUserProfile();
    }
  }, [currentUser, matchId]);

  // Initialize conversation on mount
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        setError(null);
        const { conversationId: convId, isNew } = await getOrCreateConversation(currentUser.uid, matchId);
        
        // Wait a bit for Firestore to fully create the conversation if it's new
        if (isNew) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        setConversationId(convId);
        
        // Check if there are any messages - show icebreakers if empty
        // (works for both new conversations and existing ones with no messages)
        const messageCount = await getMessageCount(convId);
        setShowIcebreakers(messageCount === 0);
        
        setLoading(false);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to load conversation. Please try again.');
        setLoading(false);
      }
    };

    if (currentUser && matchId) {
      initChat();
    }
  }, [currentUser, matchId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
      // Hide icebreakers once messages exist
      if (newMessages.length > 0) {
        setShowIcebreakers(false);
      }
    });

    return () => unsubscribe();
  }, [conversationId, currentUser.uid]);

  // Mark messages as read when conversation opens or new messages arrive
  useEffect(() => {
    if (!conversationId || messages.length === 0) return;

    // Debounce the mark as read to avoid too many calls
    const timer = setTimeout(() => {
      markMessagesAsRead(conversationId, currentUser.uid).catch(console.error);
    }, 500);

    return () => clearTimeout(timer);
  }, [conversationId, messages.length, currentUser.uid]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle icebreaker selection
  const handleIcebreakerSelect = (icebreaker) => {
    setInput(icebreaker);
    setShowIcebreakers(false);
  };

  // Handle skip icebreakers
  const handleSkipIcebreakers = () => {
    setShowIcebreakers(false);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim() || !conversationId || sending) return;

    try {
      setSending(true);
      setError(null);
      await sendMessage(conversationId, currentUser.uid, input.trim());
      setInput('');
      setShowIcebreakers(false); // Hide icebreakers after first message
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '620px', margin: '0 auto' }}>
        <div className="auth-card">
          <h2>Loading Chat...</h2>
          <p className="subtext">Please wait while we load your conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '620px', margin: '0 auto' }}>
      <div className="auth-card">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
        <button
          type="button"
          onClick={() => navigate('/conversations')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: 20,
            cursor: 'pointer',
            marginRight: 10,
            padding: 5
          }}
        >
          ← 
        </button>
        <h2 style={{ margin: 0 }}>
          Chat with{' '}
          <span
            style={{
              color: '#60a5fa',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
            onClick={() => navigate(`/profile/${matchId}`)}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            {otherUserName}
          </span>
        </h2>
      </div>

      {error && (
        <div style={{
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {/* Icebreaker Selector - shown for new conversations */}
      {showIcebreakers && (
        <IcebreakerSelector
          recipientId={matchId}
          onSelect={handleIcebreakerSelect}
          onSkip={handleSkipIcebreakers}
        />
      )}

      {/* Messages Container */}
      <div
        style={{
          marginTop: showIcebreakers ? 0 : 10,
          marginBottom: 10,
          maxHeight: 400,
          minHeight: 300,
          overflowY: 'auto',
          padding: '12px 8px',
          borderRadius: 14,
          border: '1px solid var(--border-subtle)',
          background: 'rgba(15,23,42,0.8)',
        }}
      >
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            padding: 40,
            fontSize: 14
          }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMyMessage = msg.senderId === currentUser.uid;
            const isAiMessage = msg.type === 'icebreaker';
            
            return (
              <div
                key={msg.id || idx}
                style={{
                  display: 'flex',
                  justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    borderRadius: 14,
                    fontSize: 14,
                    background: isMyMessage
                      ? 'linear-gradient(135deg,#fb7185,#ec4899)'
                      : isAiMessage
                      ? 'rgba(59,130,246,0.4)'
                      : 'rgba(15,23,42,0.9)',
                    wordWrap: 'break-word',
                  }}
                >
                  <div>{msg.text}</div>
                  <div style={{
                    fontSize: 11,
                    opacity: 0.7,
                    marginTop: 4,
                    textAlign: isMyMessage ? 'right' : 'left'
                  }}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            maxLength={1000}
          />
          <button
            type="button"
            className="nav-btn nav-solid"
            onClick={handleSendMessage}
            disabled={!input.trim() || sending}
            style={{
              opacity: (!input.trim() || sending) ? 0.5 : 1,
              cursor: (!input.trim() || sending) ? 'not-allowed' : 'pointer'
            }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>
          {input.length}/1000 characters
        </div>
      </div>
      </div>
    </div>
  );
};

export default ChatConversation;
