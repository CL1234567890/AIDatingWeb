// src/pages/Dashboard.js
import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="auth-card">
      <h2>Welcome to AIDATING</h2>
      <p className="subtext">
        You’re in. Choose what you want to do today — plan a smart date or
        browse your AI-curated matches.
      </p>

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
          View matches & chat
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
