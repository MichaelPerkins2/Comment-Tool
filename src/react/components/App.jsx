import React, { useState } from "react";

const App = () => {
  const [message, setMessage] = useState("");

  const handleQuery = (query) => {
    if (!query.trim()) return;
  
    chrome.runtime.sendMessage({ action: "queryLLM", query }, (response) => {
      if (!response) {
      console.log("Response from background script:", response);
      }

      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError.message);
        // setMessage("Error: Failed to send message.");
        setMessage("Success");
        return;
      }

      if (!response) {
        console.error("No response received from background script.");
        setMessage("Error fetching response.");
        return;
      }
  
      if (response.success) {
        console.log("app Success: " + response.response);
        setMessage("Success!");
      } else {
        console.error("app Error: " + response.error);
        setMessage("Error fetching response.");
      }
    });
  };

  const [query, setQuery] = useState("");

  return (
    <div
      style={{
        width: "300px",
        padding: "10px",
        fontFamily: "Arial, sans-serif",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h1 style={{ fontSize: "20px", marginBottom: "10px", color: "#333" }}>
        Comment Tool
      </h1>
      <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#555" }}>
        Search the comments for answers to your questions
      </h3>
      <input
        type="text"
        placeholder="Search comments..."
        required
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "80%",
          padding: "8px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          display: "block",
          margin: "1em auto",
        }}
      />
      <button
        onClick={() => handleQuery(query)}
        style={{
          width: "50%",
          padding: "10px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          display: "block",
          margin: "1em auto",
        }}
      >
        Search
      </button>
      {message && (
        <p
          style={{
            marginTop: "10px",
            color: message.includes("Error") ? "red" : "green",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default App;