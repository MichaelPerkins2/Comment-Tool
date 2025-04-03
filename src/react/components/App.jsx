import React, { useState, useEffect } from "react";

const App = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [query, setQuery] = useState("");
  const [queryHistory, setQueryHistory] = useState([]);

  const handleQuery = () => {
    chrome.runtime.sendMessage(
      { action: "queryLLM", query },
      (response) => {
        console.log("Response received:", response);

        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError.message);
          // setMessage("Error: " + chrome.runtime.lastError.message);
          return;
        }

        if (response.success) {
          console.log("Success:", response.response);
          setQueryHistory((prev) => [
            ...prev,
            { query, response: response.response },
          ]);
          setQuery("");
        } else {
          console.error("Error:", error);
        }
      }
    );
  };

  useEffect(() => {
    const listener = (message) => {
      if (message.action === "displayResponse") {
        setResponse(message.text);
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return (
    <div
      style={{
        color: "white",
        width: "300px",
        padding: "10px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#101010",
      }}
    >
      <h1 style={{ fontSize: "20px", marginBottom: "10px" }}>Comment Tool</h1>
      <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>
        Search the comments for answers to your questions
      </h3>
      <textarea
        placeholder="Search comments..."
        required
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (query.trim() && e.key === "Enter") {
            handleQuery(query);
          }
        }}
        style={{
          width: "80%",
          padding: "8px",
          marginBottom: "10px",
          display: "block",
          margin: "1em auto",
          resize: "none",
          overflow: "hidden",
          height: "auto",
          minHeight: "40px",
        }}
        onInput={(e) => {
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
      />
      <button
        onClick={() => {
          if (query.trim()) {
            handleQuery(query);
          } else {
            setMessage("Please enter a query.");
          }
        }}
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

      {queryHistory.map((entry, index) => (
        <div
          key={index}
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#181818",
            borderRadius: "4px",
          }}
        >
          <p
            style={{
              textAlign: "right",
              width: "fit-content",
              maxWidth: "80%",
              borderRadius: "4px",
              backgroundColor: "#262626",
              padding: "0.75em",
              marginLeft: "auto",
              display: "block",
            }}
          >
            {entry.query}
          </p>
          <p
            style={{
              textAlign: "left",
              width: "fit-content",
              maxWidth: "80%",
              borderRadius: "4px",
              backgroundColor: "#262626",
              padding: "0.75em",
              display: "block",
            }}
          >
            {entry.response}
          </p>
        </div>
      ))}
    </div>
  );
};

export default App;
