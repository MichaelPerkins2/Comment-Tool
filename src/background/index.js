
let cachedChannel = "";
let cachedTitle = "";
let cachedDescription = "";
let cachedComments = [];

// Query LLM and send response to popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === "sendVideoInfo") {

    cachedChannel = request.channel;
    cachedTitle = request.title;
    cachedDescription = request.description;
    cachedComments = request.comments;

  }
  
  if (request.action === "queryLLM") {

    const query = request.query;
    const chatHistory = request.chatHistory || [];
    const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const lastMessages = chatHistory.slice(-6); // Last 6 messages
    const conversationContext = lastMessages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.text}`)
      .join("\n");

    // Format comments for LLM
    const formattedComments = cachedComments.map((comment, index) => {
      return `Comment #${index + 1}:
      Author: ${comment.author}
      Text: ${comment.text}
      Likes: ${comment.likeCount}
      Date: ${comment.publishedAt}
      `;
    }).join("\n");
      
    // Set the conversation context
    const formattedPrompt = `This is a conversation in which your role is to answer questions about comments from a YouTube video for the user with whom you will communicate. If you have not received the comments to analyze, inform the user.

      YouTube video channel: ${cachedChannel}
      Video title: ${cachedTitle}
      Video description: ${cachedDescription}
      Video comments to analyze: ${formattedComments}

      Previous conversation:
      ${conversationContext}
      
      USER: ${query}
      AI (you):`;

    console.log("BACKGROUND: video info", {
      channel: cachedChannel,
      title: cachedTitle,
      description: cachedDescription,
      comments: formattedComments,
      conversationContext: conversationContext,
    })

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: formattedPrompt
              }
            ]
          }
        ]
      }),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log("Full API response:", data);
      
      if (!data.candidates || !data.candidates.length) {
        console.error("No candidates in response:", data);
        sendResponse({ 
          success: false, 
          error: data.error.message || "No response from LLM."
        });
        return;
      }
      
      const llmResponse = data.candidates[0].content.parts[0].text;
      sendResponse({ success: true, response: llmResponse });
    })
    return true;
  }
});

// Clear browser session chat history
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started. Clearing chat history.");
  chrome.storage.local.set({ chatHistory: [] });
});

// Listen for messages from content script containing comments to send to LLM
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "getComments") {
//     console.log("Background script sending comments to LLM:", request.comments);
//     // TODO: Send comments to LLM for analysis
//   }
// });

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
