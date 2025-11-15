// src/pages/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      
      // Create user with profile data
      await signup(email, password, {
        name,
        age: age ? parseInt(age) : null,
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle specific error codes
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create your account</h2>
      <p className="subtext">
        Tell us a bit about you. We'll let AI find your best matches.
      </p>

      {error && (
        <div style={{ 
          color: '#ef4444', 
          backgroundColor: '#fee2e2', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Name</span>
            <span className="helper">Required</span>
          </div>
          <input
            type="text"
            className="input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Email</span>
          </div>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Age */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Age</span>
            <span className="helper">18+</span>
          </div>
          <input
            type="number"
            className="input"
            placeholder="21"
            min="18"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Password</span>
          </div>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Confirm password */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Confirm password</span>
          </div>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="secondary-text">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
