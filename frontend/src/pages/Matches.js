// src/pages/Matches.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_MATCHES = [
  {
    id: 1,
    name: "Alex, 23",
    score: 92,
    vibe: "Cozy cafés, long walks, indie movies",
    tags: ["Introvert", "Coffee lover", "Dog person"],
  },
  {
    id: 2,
    name: "Mia, 21",
    score: 88,
    vibe: "Loves live music and rooftop bars",
    tags: ["Extrovert", "Night owl"],
  },
  {
    id: 3,
    name: "Jay, 24",
    score: 81,
    vibe: "Board games, bookstores, calm weekends",
    tags: ["Chill", "Bookworm"],
  },
];

const Matches = () => {
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const navigate = useNavigate();

  const handleLike = (id) => {
    console.log("Like", id);
    // 以后可以调 /api/matches/:id/like
  };

  const handlePass = (id) => {
    console.log("Pass", id);
    setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMessage = (id) => {
    // For now using mock ID, replace with actual Firebase user ID when integrating with real matches
    navigate(`/conversations/${id}`);
  };

  return (
    <div className="auth-card">
      <h2>Matches for you</h2>
      <p className="subtext">
        These people match your vibe based on your profile and AI analysis.
      </p>

      <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {matches.map((m) => (
          <div
            key={m.id}
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
              <div style={{ fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: "#f472b6" }}>
                {m.score}% match
              </div>
            </div>

            <p className="secondary-text" style={{ textAlign: "left", marginTop: 4 }}>
              {m.vibe}
            </p>

            <div style={{ marginTop: 6, marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {m.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.6)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="primary-button"
                style={{ flex: 2 }}
                onClick={() => handleMessage(m.id)}
              >
                Message
              </button>
              <button
                className="nav-btn nav-ghost"
                style={{ flex: 1 }}
                onClick={() => handleLike(m.id)}
              >
                Like
              </button>
              <button
                className="nav-btn nav-ghost"
                style={{ flex: 1 }}
                onClick={() => handlePass(m.id)}
              >
                Pass
              </button>
            </div>
          </div>
        ))}

        {matches.length === 0 && (
          <p className="secondary-text" style={{ textAlign: "center" }}>
            No more matches for now. Try updating your profile later!
          </p>
        )}
      </div>
    </div>
  );
};

export default Matches;
