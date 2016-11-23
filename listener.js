// this code runs in the Chrome web page context and is sent messageges
// from the U/I to do something

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    // log the request 
    console.log("Listener: " + request.action);

    if (request.action == "cleanPage") {
        // perform the cleanPage action
        actionCleanPage();
    }
    else if (request.action == "showFilteredComments") {
        // perform the showFilteredComments action
        actionShowFilteredComments();
    }
    else if (request.action == "showLikerAvatars") {
        // perform the showLikerAvatars action        
        actionShowLikerAvatars();
    }
    else if (request.action == "disableScrolling") {
        // perform the disableScrolling action        
        actionDisableScrolling();
    }
    else {
        // an unkown action was requested
        console.log("Listener: unknown action: " +  request.action);
    }
});

// tell chrome to show the extension avatar as active
chrome.runtime.sendMessage({ action: "show" });
