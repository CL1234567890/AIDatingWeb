// src/pages/Chat.js
import React, { useState } from "react";
import { useParams } from "react-router-dom";

const Chat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([
    { from: "them", text: "Hey, nice to meet you here 👋" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "me", text: input.trim() }]);
    setInput("");
  };

  const sendIcebreaker = () => {
    // TODO: 调后端 AI 接口
    const ai = "AI idea: “What’s one small thing that made you smile this week?”";
    setMessages((prev) => [...prev, { from: "ai", text: ai }]);
  };

  return (
    <div className="auth-card">
      <h2>Chat with match #{id}</h2>
      <p className="subtext">
        Start the conversation, or let AI suggest an icebreaker.
      </p>

      <div
        style={{
          marginTop: 10,
          marginBottom: 10,
          maxHeight: 260,
          overflowY: "auto",
          padding: "8px 6px",
          borderRadius: 14,
          border: "1px solid var(--border-subtle)",
          background: "rgba(15,23,42,0.8)",
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent:
                m.from === "me" ? "flex-end" : "flex-start",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "6px 10px",
                borderRadius: 14,
                fontSize: 14,
                background:
                  m.from === "me"
                    ? "linear-gradient(135deg,#fb7185,#ec4899)"
                    : m.from === "ai"
                    ? "rgba(59,130,246,0.4)"
                    : "rgba(15,23,42,0.9)",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          type="button"
          className="primary-button"
          onClick={sendIcebreaker}
        >
          Generate AI icebreaker
        </button>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            type="button"
            className="nav-btn nav-solid"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
