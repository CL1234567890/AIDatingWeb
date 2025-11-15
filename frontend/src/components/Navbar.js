// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ isAuth }) => {
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
            {/* 以后可以加 logout 按钮，这里先空着 */}
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
