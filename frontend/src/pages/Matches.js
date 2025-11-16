// src/pages/Matches.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get JWT token
        const token = await currentUser.getIdToken();

        // Fetch recommendations from API
        const response = await fetch(
          'http://localhost:8000/api/recommendations/matches?top_n=5',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        
        if (data.success && data.matches) {
          setMatches(data.matches);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUser]);

  const handleLike = (uid) => {
    console.log("Like", uid);
    // TODO: Implement like functionality
  };

  const handlePass = (uid) => {
    console.log("Pass", uid);
    setMatches((prev) => prev.filter((m) => m.uid !== uid));
  };

  const handleMessage = (uid) => {
    navigate(`/conversations/${uid}`);
  };

  if (loading) {
    return (
      <div className="auth-card">
        <h2>Finding your matches...</h2>
        <p className="secondary-text" style={{ textAlign: "center", marginTop: "20px" }}>
          Loading personalized recommendations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-card">
        <h2>Matches</h2>
        <div style={{ 
          color: '#ef4444', 
          backgroundColor: '#fee2e2', 
          padding: '12px', 
          borderRadius: '8px', 
          marginTop: '16px',
          fontSize: '14px'
        }}>
          Error loading matches: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>Matches for you</h2>
      <p className="subtext">
        AI-powered recommendations based on your profile
      </p>

      <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {matches.map((m) => {
          // Convert similarity score (0-1) to percentage
          const matchScore = Math.round(m.similarity_score * 100);
          
          // Parse interest tags
          const tags = m.interest_tags 
            ? m.interest_tags.split(',').map(tag => tag.trim()).slice(0, 5)
            : [];

          return (
            <div
              key={m.uid}
              style={{
                borderRadius: 16,
                border: "1px solid var(--border-subtle)",
                padding: "12px 14px",
                background: "rgba(15,23,42,0.9)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div 
                  style={{ 
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#60a5fa',
                    textDecoration: 'none'
                  }}
                  onClick={() => navigate(`/profile/${m.uid}`)}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  {m.name}, {m.age}
                </div>
                <div style={{ fontSize: 12, color: "#f472b6" }}>
                  {matchScore}% match
                </div>
              </div>

              <p className="secondary-text" style={{ textAlign: "left", marginTop: 4 }}>
                {m.gender}
              </p>

              <div style={{ marginTop: 6, marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.6)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="primary-button"
                  style={{ flex: 2 }}
                  onClick={() => handleMessage(m.uid)}
                >
                  Message
                </button>
                <button
                  className="nav-btn nav-ghost"
                  style={{ flex: 1 }}
                  onClick={() => handleLike(m.uid)}
                >
                  Like
                </button>
                <button
                  className="nav-btn nav-ghost"
                  style={{ flex: 1 }}
                  onClick={() => handlePass(m.uid)}
                >
                  Pass
                </button>
              </div>
            </div>
          );
        })}

        {matches.length === 0 && (
          <p className="secondary-text" style={{ textAlign: "center" }}>
            No matches found. Make sure you have a complete profile, or check back later when more users join!
          </p>
        )}
      </div>
    </div>
  );
};

export default Matches;
