// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DatePlanner from "./pages/DatePlannar";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import TestAuth from "./pages/TestAuth";
import TestIcebreaker from "./pages/TestIcebreaker";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="app">
      <Navbar isAuth={!!currentUser} />

      <main className="main-layout">
        <Routes>
          <Route
            path="/"
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/login"
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/register"
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dates"
            element={
              <ProtectedRoute>
                <DatePlanner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/:id"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/test-auth"
            element={
              <ProtectedRoute>
                <TestAuth />
              </ProtectedRoute>
            }
          />

          <Route
            path="/test-icebreaker"
            element={
              <ProtectedRoute>
                <TestIcebreaker />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
