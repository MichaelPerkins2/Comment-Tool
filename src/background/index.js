// Query LLM and send response to popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "queryLLM") {
    console.log("Background script received query:", request.query);

    const query = request.query;
    const chatHistory = request.chatHistory || [];
    const API_KEY = process.env.REACT_APP_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const lastMessages = chatHistory.slice(-6); // Last 6 messages
    const conversationContext = lastMessages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.text}`)
      .join("\n");
      
    // Set the conversation context
    const formattedPrompt = `This is a conversation. Continue it naturally.

      Previous conversation:
      ${conversationContext}
      
      USER: ${query}
      AI:`;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: formattedPrompt }] }],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const llmResponse = data.candidates[0].content.parts[0].text;
        console.log("From background, LLM Response:", llmResponse);

        sendResponse({ success: true, response: llmResponse });
      })
      .catch((error) => {
        console.error("Error querying LLM:", error);
        sendResponse({
          success: false,
          error: "Error querying LLM: " + error.message,
        });
      });
    return true;
  }
});

// Clear browser session chat history
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started. Clearing chat history.");
  chrome.storage.local.set({ chatHistory: [] });
});

// FOR INJECTION INTO WEBPAGE

//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       // chrome.tabs.query({}, (tabs) => {
//       //   console.log("Tabs found:", tabs);
//       // });

//       if (tabs[0]) {
//         chrome.tabs.sendMessage(
//           tabs[0].id,
//           {
//             action: "injectResponse",
//             response: llmResponse,
//             query: query,
//           },
//           (response) => {
//             if (chrome.runtime.lastError) {
//               console.error(
//                 "Error sending message to content script:",
//                 chrome.runtime.lastError.message
//               );
//               sendResponse({
//                 success: false,
//                 error: chrome.runtime.lastError.message,
//               });
//             } else {
//               console.log("Successfully injected content.");
//               sendResponse({ success: true, response: llmResponse });
//             }
//           }
//         );
//       } else {
//         console.error("No active tab found.");
//         sendResponse({ success: false, error: "No active tab found." });
//       }
//     });
//   } catch (error) {
//     console.error("Error querying LLM:", error);
//     sendResponse({
//       success: false,
//       error: "Error querying LLM: " + error.message,
//     });
//   }
// }
// return true;
