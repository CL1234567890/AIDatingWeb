// src/pages/Register.js
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    // TODO: Backend API
    console.log("Register:", { name, email, age, password });
  };

  return (
    <div className="auth-card">
      <h2>Create your account</h2>
      <p className="subtext">
        Tell us a bit about you. We’ll let AI find your best matches.
      </p>

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

        <button type="submit" className="primary-button">
          Sign Up
        </button>

        <p className="secondary-text">
          Already have an account?{" "}
          <Link to="/">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
