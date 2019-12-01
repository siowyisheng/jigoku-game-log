chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'jigoku.online', pathContains: 'play' },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ])
  })
})

// TO TRY THIS
// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if (request.contentScriptQuery == 'queryPrice') {
//       var url = 'https://another-site.com/price-query?itemId=' +
//           encodeURIComponent(request.itemId);
//       fetch(url)
//           .then(response => response.text())
//           .then(text => parsePrice(text))
//           .then(price => sendResponse(price))
//           .catch(error => ...)
//       return true;  // Will respond asynchronously.
//     }
//   }
// );
