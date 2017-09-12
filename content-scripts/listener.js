// listener.js - runs in the context of the web page 
"use strict";

var modules = undefined;

$(document).ready(function () {

  const STATE_WAITING_FOR_ARTICLE = "waiting for article";
  const STATE_WAITING_FOR_COMMENT_STREAM = "waiting for comment stream";
  const STATE_WAITING_FOR_COMMENTS = "waiting for comments";

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

  function createModules() {
    if (modules === undefined) {
      log("create modules");
      modules = {
        borderizer: new Module_Borderizer(),
        cleanComments: new Module_CleanComments(),
        cleanPage: Module_CleanPage(),
        customizePage: new Module_CustomizePage(),
        commentObserver: Module_CommentObserver(),
        disableScrolling: Module_DisableScrolling(),
        filterUsers: Module_FilterUsers(),
        showFilterComments: Module_ShowFilteredComments(),
        showLikerAvatars: Module_ShowLikerAvatars(),
        xhrInterceptor: Module_XhrInterceptor(),
      }
    }
  }

  function cleanPage(settings) {
    log("cleanPage: " + JSON.stringify(settings));
    createModules();
    modules.cleanPage.perform(
      settings.cleanPage,
      settings.removeMasthead,
      settings.removeVideo,
      settings.logging);
      modules.xhrInterceptor.perform(
        settings.markMyFilteredComments,
        settings.markMyFilteredCommentsColor,
        true || settings.logging);      
  }

  function applySettings(settings) {
    log("applySettings: " + JSON.stringify(settings));
    createModules();

    // copy only users enabled for filtering to send onward
    var filteredUsers = [];
    settings.filteredUsers.forEach(function (item) {
      if (item[0])
        filteredUsers.push(item[1]);
    });

    modules.customizePage.perform(
      settings.logging, 
      settings.showCustomLink ? settings.customLinkTitle : undefined,
      settings.showCustomLink ? settings.customLinkUrl : undefined      
    );

    modules.commentObserver.perform(
      settings.logging);


    modules.disableScrolling.perform(
      true,
      settings.logging);

    modules.filterUsers.perform(
      settings.filterUsers,
      filteredUsers,
      settings.logging);

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
      settings.cleanBoldCommentsPct,
      settings.cleanUpperComments,
      settings.cleanUpperCommentsPct,
      settings.cleanCommentsHighlight,
      settings.cleanCommentsColor,
      settings.logging);

    //modules.borderizer.perform(
    //  settings.cleanComments,
    //  settings.logging);      
  }

  _browser.runtime.onMessage.addListener(function (request) {

    // log the request 
    log("onMessage: " + JSON.stringify(request));

    if (request.action === APPLY_SETTINGS_MESSAGE.action) {
      applySettings(request.settings);
    }
    if (request.action === SET_FILTEREES_MESSAGE.action) {
      // copy only users enabled for filtering to send onward
      var filteredUsers = [];
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
          switch (state) {
            case STATE_WAITING_FOR_ARTICLE:
              {
                if ($("article".length)) {
                  state = STATE_WAITING_FOR_COMMENT_STREAM;
                }
                break;
              }

            case STATE_WAITING_FOR_COMMENT_STREAM:
              {
                var section = $("#commenting");
                if (section.length) {
                  cleanPage(_settings);
                  state = STATE_WAITING_FOR_COMMENTS;
                }
                break;
              }

            case STATE_WAITING_FOR_COMMENTS:
              {
                var stream = $("#livefyre_comment_stream .fyre-comment-stream");
                if (stream.length) {
                  clearInterval(chkState);
                  _browser.runtime.sendMessage(SHOW_MESSAGE);
                  window.setTimeout(function () {
                    applySettings(_settings);
                    window.ffhModules = modules;
                    console.log("settings applied");
                  }, 500);
                  state = STATE_WAITING_FOR_COMMENT_STREAM;
                }
                break;
              }
          }
        }, 500);
      }
    });
}());