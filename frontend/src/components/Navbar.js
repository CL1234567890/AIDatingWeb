// src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToConversations } from "../services/chatService";

const Navbar = ({ isAuth }) => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to conversations and count unread messages
  useEffect(() => {
    if (!currentUser || !isAuth) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeToConversations(currentUser.uid, (conversations) => {
      // Count conversations with unread messages from other users
      const unread = conversations.filter(conv => {
        const lastMsg = conv.lastMessage;
        return lastMsg && 
               lastMsg.senderId !== currentUser.uid && 
               !lastMsg.read;
      }).length;
      
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [currentUser, isAuth]);

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
      <div className="navbar-logo">IntelliLOVE</div>

      <div className="navbar-right">
        {isAuth ? (
          <>
            <Link to="/dashboard" className="nav-btn nav-ghost">
              Dashboard
            </Link>
            <Link to="/dates" className="nav-btn nav-ghost">
              Plan a date
            </Link>
            <Link to="/matches" className="nav-btn nav-ghost">
              Matches
            </Link>
            <Link 
              to="/conversations" 
              className="nav-btn nav-ghost"
              style={{ position: 'relative' }}
            >
              Messages
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  background: 'linear-gradient(135deg, #fb7185, #ec4899)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  minWidth: '18px',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="nav-btn nav-ghost">
              Profile
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
