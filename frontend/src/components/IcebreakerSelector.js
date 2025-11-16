import React, { useState, useEffect } from 'react';
import { generateIcebreakers } from '../services/api';

/**
 * IcebreakerSelector Component
 * Displays AI-generated icebreaker options for starting a new conversation
 */
const IcebreakerSelector = ({ recipientId, onSelect, onSkip }) => {
  const [icebreakers, setIcebreakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIcebreakers = async () => {
      try {
        setLoading(true);
        setError(null);
        const generated = await generateIcebreakers(recipientId, 3);
        setIcebreakers(generated);
      } catch (err) {
        console.error('Error fetching icebreakers:', err);
        setError('Could not generate icebreakers. You can write your own message!');
        // Set fallback icebreakers
        setIcebreakers([
          "Hey! Your profile caught my attention. What do you like to do for fun?",
          "Hi there! I'd love to get to know you better. What's your favorite way to spend a weekend?",
          "Hello! I noticed we might have some things in common. What are you passionate about?"
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (recipientId) {
      fetchIcebreakers();
    }
  }, [recipientId]);

  if (loading) {
    return (
      <div style={{
        padding: '16px',
        marginBottom: 10,
        borderRadius: 14,
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <div style={{ 
          textAlign: 'center',
          color: 'var(--text-primary)',
          fontSize: 14
        }}>
          <div style={{ marginBottom: 8 }}>✨ Generating personalized icebreakers...</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>This will just take a moment</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      marginBottom: 10,
      borderRadius: 14,
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    }}>
      <div style={{
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 12,
        color: 'var(--text-primary)'
      }}>
        Start the conversation! Pick one:
      </div>

      {error && (
        <div style={{
          padding: 8,
          marginBottom: 10,
          borderRadius: 8,
          background: 'rgba(251, 191, 36, 0.1)',
          color: '#fbbf24',
          fontSize: 12
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {icebreakers.map((icebreaker, index) => (
          <button
            key={index}
            onClick={() => onSelect(icebreaker)}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'var(--text-primary)',
              fontSize: 14,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              lineHeight: 1.4
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            {icebreaker}
          </button>
        ))}

        <button
          onClick={onSkip}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: 13,
            textAlign: 'center',
            cursor: 'pointer',
            marginTop: 4
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
         Write your own message
        </button>
      </div>

      <div style={{
        marginTop: 12,
        fontSize: 11,
        color: 'var(--text-secondary)',
        textAlign: 'center',
        opacity: 0.7
      }}>
       These messages are AI-generated based on your match's profile
      </div>
    </div>
  );
};

export default IcebreakerSelector;
