// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ isAuth }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
    <header className="navbar">
      <div className="navbar-logo">AIDATING</div>

      <div className="navbar-right">
        {isAuth ? (
          <>
            <Link to="/dates" className="nav-btn nav-ghost">
              Plan a date
            </Link>
            <Link to="/matches" className="nav-btn nav-ghost">
              Matches
            </Link>
            <button onClick={handleLogout} className="nav-btn nav-ghost" style={{ cursor: 'pointer' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn nav-ghost">
              Log in
            </Link>
            <Link to="/register" className="nav-btn nav-solid">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
