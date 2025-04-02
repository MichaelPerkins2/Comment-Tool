console.log("Content script running!");

function injectText() {
  let videoTitle = document.querySelector("#above-the-fold");
  if (!videoTitle) return;

  let dummyDiv = document.createElement("div");
  dummyDiv.innerText = "This is a test text injected by the extension!";
  dummyDiv.style.background = "rgb(66, 66, 66)";
  dummyDiv.style.padding = "10px";
  dummyDiv.style.marginTop = "10px";
  dummyDiv.style.borderRadius = "8px";
  dummyDiv.style.fontSize = "16px";

  videoTitle.parentElement.insertBefore(dummyDiv, videoTitle.nextSibling);
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectText") {
    injectText();
    sendResponse({ success: true });
  }
  return true;
});
