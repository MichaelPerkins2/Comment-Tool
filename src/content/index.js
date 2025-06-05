console.log("Content script running!");

window.addEventListener("load", () => {
  setTimeout(getVideoData, 3000);
});

function getVideoData() {
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  const baseUrl = "https://www.googleapis.com/youtube/v3";
  const videoId = new URLSearchParams(window.location.search).get("v");

  let channel = "";
  let title = "";
  let description = "";
  let comments = [];

  const videoDataPromise = fetch(
    `${baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      channel = data.items[0].snippet.channelTitle;
      title = data.items[0].snippet.title;
      description = data.items[0].snippet.description;
    })
    .catch((error) => {
      console.error("Error fetching video data:", error);
    });

  const commentsPromise = fetch(
    `${baseUrl}/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      comments = data.items.map((item) => {
        return {
          text: item.snippet.topLevelComment.snippet.textDisplay,
          author: item.snippet.topLevelComment.snippet.authorDisplayName,
          likeCount: item.snippet.topLevelComment.snippet.likeCount,
          publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
        };
      });
    })
    .catch((error) => {
      console.error("Error fetching comments:", error);
    });

  // TODO: iterate through replies
  // fetch(`${baseUrl}/comments?part=snippet&parentId=${item.id}&key=${apiKey}`)
  Promise.all([videoDataPromise, commentsPromise])
    .then(() => {
      chrome.runtime.sendMessage({
        action: "sendVideoInfo",
        channel: channel,
        title: title,
        description: description,
        comments: comments,
      });
    })
    .catch((error) => {
      console.error("Error in fetching video data or comments:", error);
    });
}

// DOM scraping
// function getVideoInfo() {
//   console.log("GET TEST START");
//   getTest();
//   const channelElement = document.querySelector(
//     "#channel-name a.yt-simple-endpoint.style-scope.yt-formatted-string"
//   );
//   const channel = channelElement
//     ? channelElement.innerText.trim()
//     : "Channel name not found";
//   console.log("Channel:", channel);

//   const titleElement = document.querySelector(
//     "h1.style-scope.ytd-watch-metadata"
//   );
//   const title = titleElement
//     ? titleElement.innerText.trim()
//     : "Title not found";
//   console.log("Title:", title);

//   const descriptionElement = document.querySelector(
//     "#description-inner.style-scope.ytd-watch-metadata"
//   );
//   const description = descriptionElement
//     ? descriptionElement.innerText.trim()
//     : "Description not found";
//   console.log("Description:", description);

//   const comments = [];
//   document
//     .querySelectorAll(
//       "#comments #contents.style-scope.ytd-item-section-renderer"
//     )
//     .forEach((comment) => {
//       comments.push({
//         text: comment.innerText,
//         author:
//           comment.closest("ytd-comment-renderer")?.querySelector("#author-text")
//             ?.innerText || "Unknown",
//       });
//     });
//   console.log("Comments:", comments);

//   chrome.runtime.sendMessage({
//     action: "sendVideoInfo",
//     channel: channel,
//     title: title,
//     description: description,
//     comments: comments,
//   });

//   console.log("Sending video info");
// }

// Inject response into the page
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "injectResponse") {
//     const aiResponse = request.response;
//     const query = request.query;

//     let videoTitle = document.querySelector("#above-the-fold");
//     if (!videoTitle || !videoTitle.parentElement) {
//       sendResponse({ success: false, error: "Target element not found" });
//       return true;
//     }

//     let newDiv = document.createElement("div");

//     let queryElement = document.createElement("span");
//     queryElement.innerHTML = `<strong>> ${query.replace(/\n/g, "<br>")}</strong><br>`;
//     // TODO: set queryElement to the right of the container

//     let responseElement = document.createElement("span");
//     responseElement.innerHTML = aiResponse.replace(/\n/g, "<br>");

//     newDiv.appendChild(queryElement);
//     newDiv.appendChild(document.createElement("br"));
//     newDiv.appendChild(responseElement);

//     newDiv.style.color = "white";
//     newDiv.style.fontFamily = "Arial, sans-serif";
//     newDiv.style.background = "rgb(33, 33, 33)";
//     newDiv.style.padding = "10px";
//     newDiv.style.marginTop = "10px";
//     newDiv.style.borderRadius = "8px";
//     newDiv.style.fontSize = "14px";

//     videoTitle.parentElement.insertBefore(newDiv, videoTitle.nextSibling);
//     sendResponse({ success: true });

//     return true;
//   } else {
//     sendResponse({
//       success: false,
//       error: "Failed to find target element, or some other error has occurred",
//     });
//     console.log("Error: " + request.error);

//     return true;
//   }
// });
