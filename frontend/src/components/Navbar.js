// src/components/Navbar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-logo">AIDATING</div>
      <div className="navbar-right">
        <Link
          to="/"
          className={`nav-btn nav-ghost ${pathname === "/" ? "nav-active" : ""}`}
        >
          Log in
        </Link>
        <Link
          to="/register"
          className={`nav-btn nav-solid ${
            pathname === "/register" ? "nav-active" : ""
          }`}
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
