document.getElementById("button").onclick = () => {
  chrome.tabs.executeScript({
    file: "parser.js"
  });
};