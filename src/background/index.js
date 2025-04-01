
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'queryLLM') {
    const query = request.query;
    const API_KEY = 'AIzaSyCyjlx2SYNgGoTQBea7WnbldHM3GdNUzmQ';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: request.query }] }]
        })
      });

      const data = await resp.json();
      const llmResponse = data.candidates[0].content.parts[0].text;
      console.log('LLM Response:', llmResponse);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'injectLLMResponse', response: llmResponse, query: query }
          , (response) => {
            if (response && response.success) {
              console.log('Response injected successfully.');
              sendResponse({ 
                success: true, 
                response: llmResponse 
              });
            } else {
              console.error('Failed to inject response:', response.error);
              sendResponse({ 
                success: false, 
                error: 'Failed to inject response: ' + response.error 
              });
            }
          }
          );
        }
      });

    } catch (error) {
      console.error('Error querying LLM:', error);
      sendResponse({ 
        success: false, 
        error: 'Error querying LLM: ' + error.message
      });
    }
  }
  return true;
});