// src/pages/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  // Basic fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  
  // New fields for recommendation algorithm
  const [gender, setGender] = useState("");
  const [sexualOrientation, setSexualOrientation] = useState("");
  const [location, setLocation] = useState("");
  const [incomeBracket, setIncomeBracket] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [interestTags, setInterestTags] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Options for dropdowns (matching exact values from recommendation algorithm data)
  const genderOptions = [
    "Prefer Not to Say",
    "Male",
    "Female",
    "Non-binary",
    "Genderfluid",
    "Transgender"
  ];

  const orientationOptions = [
    "Straight",
    "Gay",
    "Lesbian",
    "Bisexual",
    "Pansexual",
    "Queer",
    "Asexual",
    "Demisexual"
  ];

  const incomeBracketOptions = [
    "Very Low",
    "Low",
    "Lower-Middle",
    "Middle",
    "Upper-Middle",
    "High",
    "Very High"
  ];

  const educationLevelOptions = [
    "No Formal Education",
    "High School",
    "Diploma",
    "Associate's",
    "Bachelor's",
    "Master's",
    "MBA",
    "PhD",
    "Postdoc"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!age || parseInt(age) < 18) {
      setError("You must be at least 18 years old.");
      return;
    }

    if (!gender) {
      setError("Please select your gender.");
      return;
    }

    if (!sexualOrientation) {
      setError("Please select your sexual orientation.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter your location.");
      return;
    }

    if (!incomeBracket) {
      setError("Please select your income bracket.");
      return;
    }

    if (!educationLevel) {
      setError("Please select your education level.");
      return;
    }

    if (!interestTags.trim()) {
      setError("Please enter your interests.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      
      // Create user with complete profile data for recommendation algorithm
      await signup(email, password, {
        name,
        age: parseInt(age),
        gender,
        sexual_orientation: sexualOrientation,
        location: location.trim(),
        income_bracket: incomeBracket,
        education_level: educationLevel,
        interest_tags: interestTags.trim()
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
        Tell us about yourself so we can find your perfect matches.
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
            required
          />
        </div>

        {/* Gender */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Gender</span>
            <span className="helper">Required</span>
          </div>
          <select
            className="input"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="">Select your gender</option>
            {genderOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Sexual Orientation */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Sexual Orientation</span>
            <span className="helper">Required</span>
          </div>
          <select
            className="input"
            value={sexualOrientation}
            onChange={(e) => setSexualOrientation(e.target.value)}
            required
          >
            <option value="">Select your orientation</option>
            {orientationOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Location</span>
            <span className="helper">City, State or Region</span>
          </div>
          <input
            type="text"
            className="input"
            placeholder="e.g., San Francisco, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        {/* Income Bracket */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Income Bracket</span>
            <span className="helper">Required</span>
          </div>
          <select
            className="input"
            value={incomeBracket}
            onChange={(e) => setIncomeBracket(e.target.value)}
            required
          >
            <option value="">Select income bracket</option>
            {incomeBracketOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Education Level */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Education Level</span>
            <span className="helper">Required</span>
          </div>
          <select
            className="input"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            required
          >
            <option value="">Select education level</option>
            {educationLevelOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Interest Tags */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Interests & Hobbies</span>
            <span className="helper">Comma-separated</span>
          </div>
          <textarea
            className="input"
            placeholder="e.g., hiking, reading, cooking, travel, music, sports"
            value={interestTags}
            onChange={(e) => setInterestTags(e.target.value)}
            rows="3"
            required
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
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
