// listener.js - runs in the context of the web page 

var modules = undefined;

$(document).ready(function () {
  var logging = true; // log until settings read
  var state = STATE_WAITING_FOR_ARTICLE;

  function logAll(line) {
    console.log((new Date()).getTime() + ": " + line);
  }

  function log(line) {
    if (logging) {
      logAll(line);
    }
  }

  log("listener loaded");

  const _browser = window.browser ? window.browser : window.chrome;

  function applySettings(settings) {
    log("applySettings: " + JSON.stringify(settings));

    if (modules === undefined) {
      log("create modules");
      modules = {
        borderizer: new Module_Borderizer(),
        cleanComments: new Module_CleanComments(),
        cleanPage: Module_CleanPage(),
        commentObserver: Module_CommentObserver(),
        disableScrolling: Module_DisableScrolling(),
        filterUsers: Module_FilterUsers(),
        showFilterComments: Module_ShowFilteredComments(),
        showLikerAvatars: Module_ShowLikerAvatars(),
        xhrInterceptor: Module_XhrInterceptor(),
      }
    };

    // copy only users enabled for filtering to send onward
    filteredUsers = [];
    settings.filteredUsers.forEach(function (item) {
      if (item[0])
        filteredUsers.push(item[1]);
    });

    modules.commentObserver.perform(
      settings.logging);

    modules.cleanPage.perform(
      settings.cleanPage,
      settings.removeVideo,
      settings.logging);

    modules.disableScrolling.perform(
      settings.disableScrolling,
      settings.logging);

    modules.filterUsers.perform(
      settings.filterUsers,
      filteredUsers,
      settings.logging,);

    modules.showFilterComments.perform(
      settings.showFilteredComments,
      settings.showFilteredCommentsHighlight,
      settings.showFilteredCommentsColor,
      settings.logging);

    modules.showLikerAvatars.perform(
      settings.showLikerAvatars,
      settings.logging);

    modules.cleanComments.perform(
      settings.cleanComments,
      settings.cleanBlankLines,
      settings.cleanBoldComments,
      settings.cleanUpperComments,
      settings.cleanCommentsHighlight,
      settings.cleanCommentsColor,
      settings.logging);

    modules.xhrInterceptor.perform(
      settings.markMyFilteredComments,
      settings.markMyFilteredCommentsColor,
      settings.logging);

    //modules.borderizer.perform(
    //  settings.cleanComments,
    //  settings.logging);      
  }

  _browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    // log the request 
    log("onMessage: " + JSON.stringify(request));

    if (request.action === APPLY_SETTINGS_MESSAGE.action) {
      applySettings(request.settings);
    }
    if (request.action === SET_FILTEREES_MESSAGE.action) {
      // copy only users enabled for filtering to send onward
      filteredUsers = [];
      request.filteredUsers.forEach(function (item) {
        if (item[0])
          filteredUsers.push(item[1]);
      });
      modules.filterUsers.perform(
        request.enabled,
        filteredUsers, 
        logging);      
    }
  });

  // on startup:
  // 1. load settings
  // 2. wait for page load complete
  // 3. show icon as active
  // 4. apply settings if auto-apply specified

  _browser.runtime.sendMessage(
    GET_SETTINGS_MESSAGE,
    function (_settings) {
      if (arguments.length < 1) {
        logAll("loadSettings: ERROR, " + JSON.stringify(chrome.runtime.lastError));
      } else {
        logging = _settings.logging;
        log("loadSettings: " + JSON.stringify(_settings));

        // show the extension avatar as active once the page is loaded
        // and apply settings if selected

        var chkState = setInterval(function () {
          log("Listener: " + state + " ||| " + document.readyState);
          if (state == STATE_WAITING_FOR_ARTICLE) {
            if ($("article".length)) {
              state = STATE_WAITING_FOR_COMMENT_STREAM;
            }
          } else if (state == STATE_WAITING_FOR_COMMENT_STREAM) {
            var stream = $("#livefyre_comment_stream .fyre-comment-stream");
            if (stream.length) {
              clearInterval(chkState);
              _browser.runtime.sendMessage(SHOW_MESSAGE);
              window.setTimeout(function () {
                applySettings(_settings);
                window.ffhModules = modules;
                console.log("settings applied");
              }, 1000);
            }
          }
        }, 250);
      }
    });
}());