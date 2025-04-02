console.log("Content script running!");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectLLMResponse") {
    const aiResponse = request.response;
    const query = request.query;

    let videoTitle = document.querySelector("#above-the-fold");
    if (!videoTitle || !videoTitle.parentElement) {
      sendResponse({ success: false, error: "Target element not found" });
      return true;
    }

    let newDiv = document.createElement("div");

    let queryElement = document.createElement("span");
    queryElement.innerHTML = `<strong>> ${query.replace(/\n/g, "<br>")}</strong><br>`;
    // TODO: set queryElement to the right of the container

    let responseElement = document.createElement("span");
    responseElement.innerHTML = aiResponse.replace(/\n/g, "<br>");

    newDiv.appendChild(queryElement);
    newDiv.appendChild(document.createElement("br"));
    newDiv.appendChild(responseElement);

    newDiv.style.color = "white";
    newDiv.style.fontFamily = "Arial, sans-serif";
    newDiv.style.background = "rgb(33, 33, 33)";
    newDiv.style.padding = "10px";
    newDiv.style.marginTop = "10px";
    newDiv.style.borderRadius = "8px";
    newDiv.style.fontSize = "14px";

    videoTitle.parentElement.insertBefore(newDiv, videoTitle.nextSibling);
    sendResponse({ success: true });

    return true;
  } else {
    sendResponse({
      success: false,
      error: "Failed to find target element, or some other error has occurred",
    });
    console.log("Error: " + request.error);

    return true;
  }
});