chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "queryLLM") {
    const query = request.query;
    const API_KEY = process.env.REACT_APP_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: request.query }] }],
        }),
      });

      const data = await resp.json();
      const llmResponse = data.candidates[0].content.parts[0].text;

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "injectLLMResponse",
              response: llmResponse,
              query: query,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error sending message to content script:",
                  chrome.runtime.lastError.message
                );
                sendResponse({
                  success: false,
                  error: chrome.runtime.lastError.message,
                });
              } else {
                console.log("Successfully injected content.");
                sendResponse({ success: true, response: llmResponse });
              }
            }
          );
        } else {
          console.error("No active tab found.");
          sendResponse({ success: false, error: "No active tab found." });
        }
      });
    } catch (error) {
      console.error("Error querying LLM:", error);
      sendResponse({
        success: false,
        error: "Error querying LLM: " + error.message,
      });
    }
  }
  return true;
});
