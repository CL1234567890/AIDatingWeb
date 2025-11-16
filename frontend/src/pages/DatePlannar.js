// src/pages/DatePlanner.js
import React, { useState } from "react";
import { planDate } from "../services/api";

const DatePlanner = () => {
  const [mood, setMood] = useState("");
  const [budget, setBudget] = useState("medium");
  const [indoorOutdoor, setIndoorOutdoor] = useState("either");
  const [distance, setDistance] = useState(5);
  const [timeOfDay, setTimeOfDay] = useState("evening");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const result = await planDate({ 
        mood, 
        budget, 
        indoorOutdoor, 
        distance, 
        timeOfDay 
      });
      setPlan(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>AI Date Planner</h2>
      <p className="subtext">
        Describe your vibe and preferences. We’ll build a smart route with
        places that match your mood.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Mood */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Mood / Vibe</span>
            <span className="helper">How do you feel today?</span>
          </div>
          <textarea
            className="input"
            rows={3}
            placeholder="e.g. I’m tired from work, want something cozy and not too crowded…"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />
        </div>

        {/* Budget */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Budget</span>
          </div>
          <select
            className="input"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            <option value="low">$ Low</option>
            <option value="medium">$$ Medium</option>
            <option value="high">$$$ High</option>
          </select>
        </div>

        {/* Indoor / outdoor */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Indoor / Outdoor</span>
          </div>
          <select
            className="input"
            value={indoorOutdoor}
            onChange={(e) => setIndoorOutdoor(e.target.value)}
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="either">Either</option>
          </select>
        </div>

        {/* Distance slider */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Max distance (km)</span>
            <span className="helper">{distance} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="input"
          />
        </div>

        {/* Time of day */}
        <div className="form-group">
          <div className="label-row">
            <span className="label">Time of day</span>
          </div>
          <select
            className="input"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="late-night">Late night</option>
          </select>
        </div>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Planning..." : "Generate date plan"}
        </button>

        {error && (
          <p className="secondary-text" style={{ color: "#fda4af" }}>
            {error}
          </p>
        )}
      </form>

      {/* Result section */}
      {plan && (
        <div style={{ marginTop: "18px" }}>
          <h3 style={{ marginBottom: "8px" }}>Suggested plan</h3>
          <p className="secondary-text" style={{ textAlign: "left" }}>
            {plan.summary}
          </p>

          <div style={{ marginTop: "12px" }}>
            {plan.locations.map((loc, index) => (
              <div
                key={`${loc.name}-${index}`}
                style={{
                  borderRadius: "14px",
                  border: "1px solid var(--border-subtle)",
                  padding: "10px 12px",
                  marginBottom: "8px",
                  background: "rgba(15,23,42,0.85)",
                }}
              >
                <div style={{ fontWeight: 600 }}>{loc.name}</div>
                <div className="secondary-text" style={{ textAlign: "left" }}>
                  {loc.type} · {loc.address}
                </div>
              </div>
            ))}
          </div>

          {plan.routeUrl && (
            <a
              className="primary-button"
              href={plan.routeUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                width: "100%",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              Open route in Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePlanner;
