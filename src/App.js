// src/App.js
import React from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-layout">
        <Routes>
          {/* 默认首页：登录 */}
          <Route path="/" element={<Login />} />
          {/* 注册页 */}
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
