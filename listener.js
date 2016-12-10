// this code runs in the Chrome web page context and is sent messageges
// from the U/I to do something

var modules = undefined;
var lastOptions = undefined;

chrome.runtime.onMessage.addListener(function (options, sender, sendResponse) {

  var loggingEnabled = options.logging;

  function log(line) {
      if (loggingEnabled) {
          console.log("Listener: " + line);
      }
  }

  // log the request 
  log("Listener: " + options);

  if (options==="requestOptions") {
    // a request for the last options
    log("returning options: " + options);
    sendResponse(lastOptions);
    return;  
  };

  lastOptions = options;

  if (modules === undefined) {
    log("create modules");
    modules = {
      cleanPage: Module_CleanPage(),
      commentObserver : Module_CommentObserver(),     
      disableScrolling : Module_DisableScrolling(),
      filterUsers : Module_FilterUsers(),
      showFilterComments : Module_ShowFilteredComments(),
      showLikerAvatars : Module_ShowLikerAvatars(),
    }
  };

  // copy only users enabled for filtering to send onward
  filteredUsers = [];
  options.filteredUsers.forEach(function (item) {
    if (item[0])
      filteredUsers.push(item[1]);
  });

  modules.commentObserver.perform(
    options.logging );

  modules.cleanPage.perform(
    options.cleanPage, 
    options.logging );

  modules.disableScrolling.perform(
    options.disableScrolling,
    options.logging );

  modules.filterUsers.perform(
    options.filterUsers, 
    options.logging, 
    filteredUsers );

  modules.showFilterComments.perform(
    options.showFilteredComments,
    options.logging );

  modules.showLikerAvatars.perform(
    options.showLikerAvatars,
    options.logging );
});

// tell chrome to show the extension avatar as active
// once the page is loaded

var chkReadyState = setInterval(function() {
    // TODO: Change this to enable the "Apply" button and 
    // show a message in the popup page that the target
    // page is loading
    if (document.readyState == "complete") {
        clearInterval(chkReadyState);
        chrome.runtime.sendMessage({
          action: "show"
        });
    } else {
      console.log("Listener: " + "waiting for load complete");
    }
}, 100);
