document.getElementById("button").onclick = () => {
  chrome.tabs.executeScript({
    file: "parser-v2.js"
  });
};