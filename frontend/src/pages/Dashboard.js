// src/pages/Dashboard.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="auth-card">
      <h2>Welcome to AIDATING</h2>
      <p className="subtext">
        You're in. Choose what you want to do today — plan a smart date or
        browse your AI-curated matches.
      </p>

      {/* User ID Display for Testing */}
      {currentUser && (
        <div style={{
          marginTop: 10,
          padding: '10px 12px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'monospace'
        }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>
            Your User ID (for testing):
          </div>
          <div style={{ 
            color: 'var(--text-primary)',
            wordBreak: 'break-all',
            userSelect: 'all',
            cursor: 'text'
          }}>
            {currentUser.uid}
          </div>
          <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 11 }}>
            Click to select, then copy (Ctrl+C / Cmd+C)
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Link
          to="/dates"
          className="primary-button"
          style={{ textAlign: "center", textDecoration: "none" }}
        >
          Plan a date
        </Link>

        <Link
          to="/matches"
          className="nav-btn nav-ghost"
          style={{
            textAlign: "center",
            textDecoration: "none",
            width: "100%",
          }}
        >
          View matches
        </Link>

        <Link
          to="/conversations"
          className="nav-btn nav-ghost"
          style={{
            textAlign: "center",
            textDecoration: "none",
            width: "100%",
          }}
        >
          View messages
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
