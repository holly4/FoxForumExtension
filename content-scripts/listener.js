// listener.js - runs in the context of the web page 
"use strict";

var modules = undefined;

$(document).ready(function () {

  const STATE_WAITING_FOR_ARTICLE = "waiting for article";
  const STATE_WAITING_FOR_COMMENT_STREAM = "waiting for comment stream";

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
  //$(".ob-widget-section").remove();
  //$(".ob_what").remove();
  
  const _browser = window.browser ? window.browser : window.chrome;

  function createModules() {
    if (modules === undefined) {
      log("create modules");
      modules = {
        cleanPage: Module_CleanPage(),
        // customizePage: new Module_CustomizePage(),
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

  _browser.runtime.onMessage.addListener(function (request) {

    // log the request 
    log("onMessage: " + JSON.stringify(request));
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
                  clearInterval(chkState);
                  cleanPage(_settings);
                }
                break;
              }
          }
        }, 500);
      }
    });

  // listen for complete message
  //window.addEventListener("message", function (event) {
  //  console.log("MESSAGE", event.data);
  //  if (event.data === "ffhcomplete") {
  //    console.log("ffhcomplete");
  //    $('body').prepend('<h1 id="ffhcomplete">ffhcomplete</h1>');
  //  }
  //});

}());