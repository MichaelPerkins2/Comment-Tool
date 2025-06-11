import React, { useState, useEffect } from "react";

const App = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [query, setQuery] = useState("");
  // const [queryHistory, setQueryHistory] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);

  const handleQuery = () => {
    if (!query.trim()) return;

    const newUserMessage = { role: "user", text: query };
    console.log("New user message:", newUserMessage);

    chrome.runtime.sendMessage(
      { action: "queryLLM", query, chatHistory: chatHistory },
      (response) => {
        console.log("Response received:", response);

        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError.message);
          setMessage("Error: " + chrome.runtime.lastError.message);
          return;
        }

        if (!response || !response.success) {
          console.error("Error fetching response:", response.error);
          setMessage("Error: " + response.error);
          return;
        }

        if (response.success) {
          console.log("Success:", response.response);

          const newAiMessage = { role: "ai", text: response.response };
          setChatHistory((prevHistory) => {
            const updatedHistory = [
              ...prevHistory,
              newUserMessage,
              newAiMessage,
            ];
            // const updatedHistory = [...chatHistory, newUserMessage, newAiMessage];
            // setChatHistory(updatedHistory);
            chrome.storage.local.set({ chatHistory: updatedHistory });
            return updatedHistory;
          });

          // setQueryHistory((prev) => [
          //   ...prev,
          //   { query, response: response.response },
          // ]);
          setQuery("");
        } else {
          console.error("Error:", error);
        }
      }
    );
  };

  // Listen for messages from the background script - receive LLM response
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

  // Load chat history when extension opens -- persistence
  useEffect(() => {
    chrome.storage.local.get("chatHistory", (data) => {
      if (data.chatHistory) {
        setChatHistory(data.chatHistory);
      }
    });
  }, []);

  // Clear chat history on page reload -- see background script
  // useEffect(() => {
  //   const handleUnload = () => {
  //     chrome.storage.local.remove("chatHistory", () => {
  //       console.log("Chat history cleared.");
  //     });
  //   };

  //   window.addEventListener("beforeunload", handleUnload);
  //   return () => {
  //     window.removeEventListener("beforeunload", handleUnload);
  //   };
  // }, []);

  // Popup format
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
      {/* Title */}
      <h1 style={{ fontSize: "20px", marginBottom: "10px" }}>Comment Tool</h1>
      <h3 style={{ fontSize: "15px", marginBottom: "15px" }}>
        Search the comments for answers to your questions
      </h3>

      {/* Conversation */}
      {chatHistory.length > 0 && (
        <div
          className="conversation-container"
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#181818",
            borderRadius: "6px",
          }}
        >
          {chatHistory.map((entry, index) => (
            <div key={index}>
              <p
                style={{
                  textAlign: entry.role === "user" ? "right" : "left",
                  width: "fit-content",
                  maxWidth: "80%",
                  borderRadius: "6px",
                  backgroundColor: "#262626",
                  padding: "0.75em",
                  marginLeft: entry.role === "user" ? "auto" : "0",
                  display: "block",
                }}
              >
                {entry.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Input Search Field */}
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
          height: "1em",
          minHeight: "1em",
        }}
        onInput={(e) => {
          if (e.target.scrollHeight > 0) {
            e.target.style.height = "auto";
          }
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

      {/* Clear History Button */}
      <button
        style={{
          width: "30%",
          padding: "5px",
          backgroundColor: "#8b0000",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          display: "block",
          margin: "0.5em auto",
        }}
        onClick={() => {
          chrome.storage.local.remove("chatHistory");
          setChatHistory([]);
        }}
      >
        Clear History
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
