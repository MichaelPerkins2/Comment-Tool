
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'searchComments') {
    sendResponse({
      success: true,
      results: ["Dummy comment for search"]
    });
  }
  return true;
})