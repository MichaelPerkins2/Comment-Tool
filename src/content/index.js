(() => {
    console.log("Content script running!");
  
    const addDummyText = () => {
      let videoTitle = document.querySelector("#above-the-fold");
      if (!videoTitle) return;
  
      let dummyDiv = document.createElement("div");
      dummyDiv.innerText = "🔍 This is a test text injected by the extension!";
      dummyDiv.style.background = "yellow";
      dummyDiv.style.padding = "10px";
      dummyDiv.style.marginTop = "10px";
  
      videoTitle.parentElement.insertBefore(dummyDiv, videoTitle.nextSibling);
    };
  
    addDummyText();
  })();
  