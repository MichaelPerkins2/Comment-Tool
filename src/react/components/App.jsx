import React from "react";

const App = () => {
  const injectText = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      let tabId = tabs[0].id;

      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          let videoTitle = document.querySelector("#above-the-fold");
          if (!videoTitle) return;

          let dummyDiv = document.createElement("div");
          dummyDiv.innerText = "Button Clicked! Dummy Text Added!";
          dummyDiv.style.background = "blue";
          dummyDiv.style.padding = "10px";
          dummyDiv.style.marginTop = "10px";

          videoTitle.parentElement.insertBefore(dummyDiv, videoTitle.nextSibling);
        }
      });
    });
  };

  return (
    <div>
      <h1>Comment Tool</h1>
      <button onClick={injectText}>Add Dummy Text</button>
    </div>
  );
};

export default App;
