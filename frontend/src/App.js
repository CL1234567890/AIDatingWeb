// src/App.js
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DatePlanner from "./pages/DatePlannar";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";

const ProtectedRoute = ({ isAuth, children }) => {
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuth, setIsAuth] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuth(true);
  };

  return (
    <Router>
      <div className="app">
        <Navbar isAuth={isAuth} />

        <main className="main-layout">
          <Routes>

            <Route
              path="/"
              element={
                isAuth ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />


            <Route
              path="/login"
              element={
                isAuth ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            <Route path="/register" element={<Register />} />


            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />


            <Route
              path="/dates"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <DatePlanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <Matches />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:id"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <Chat />
                </ProtectedRoute>
              }
            />


            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
