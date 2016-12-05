// listen for the request to show the extension as active and 
// forward it to the U/I

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "show") {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      chrome.pageAction.show(tabs[0].id);
    });
  }
});

// chrome.runtime.onInstalled should be available but sanity check it
if (chrome.runtime.onInstalled) {
  // show the welcome page on first time install
  chrome.runtime.onInstalled.addListener(function (details) {
      if (details.reason == "install") {
        chrome.tabs.create({url: "http://hollies.pw/static/ffh/v100/welcome/"}, function (tab) {});
      }
  });
}