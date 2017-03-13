"use strict";

// Monitor XHRs

//window.XHRs = [];

/* exported Module_XhrInterceptor */
function Module_XhrInterceptor() {
  var loggingEnabled;
  var highlightColor;
  var active;
  var userName = undefined;

  function log(line) {
    if (loggingEnabled) {
      console.log("XhrInterceptor: " + line);
    }
  }

  // process a single comment state
  function processState(id, state) {
    // only process those with visibility state of 2
    if (state.vis == 2) {
      // retrieve logged in user name if unknown
      if (!userName) {
        userName = getUserName();
        if (userName != "") {
          log("set userName to " + userName);
        }
      }
      // if have logged in user see it matches comment
      if (userName) {
        var article = $("article[data-message-id='" + id + "']");
        if (article.length) {
          var wrapper = article.find(".fyre-comment-wrapper");
          if (wrapper.length) {
            var user = wrapper.find(".fyre-comment-user").attr("data-from");
            if (user == userName) {
              log("deleted comment  " + id + " from " + user);
              wrapper.css("background-color", highlightColor);
            }
          }
        }
      }
    }
  }

  // listen for the XHR messages
  window.addEventListener("message", function (event) {
    if (active && event.source == window) {
      if (event.data) {
        var obj = JSON.parse(event.data);
        if (window.XHRs) {
          window.XHRs.push(obj);
          log("XHR[" + (window.XHRs.length - 1) + "]");
        }
        if (obj.data && obj.data.states) {
          for (var id in obj.data.states) {
            var state = obj.data.states[id];
            processState(id, state);
          }
        }
      }
    }
  });

  return {
    perform: perform,
  };

  // is the module installed on the page?
  function isInstalled() {
    return $("#xhr-interceptor").length > 0;
  }

  // entry point to the module:
  //  state: true/false if module is enabled
  function perform(state, _highlightColor, _loggingEnabled) {
    active = state;
    loggingEnabled = _loggingEnabled;
    highlightColor = _highlightColor;
    log("perform " + state);

    // the script will only be installed one and never removed
    if (state && !isInstalled()) {
      log("installing");
      $("<script id='xhr-interceptor'>")
        .attr("type", "text/javascript")
        .attr("src", chrome.extension.getURL("content-scripts/xhr-interceptor.js"))
        .appendTo("head");
    }
  }
}