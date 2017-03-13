"use strict";

// the module to enable and disable scrolling

/* exported Module_GetMoreComments */
function Module_GetMoreComments() {
  var loggingEnabled;

  function log(line) {
    if (loggingEnabled) {
      console.log("DisableScrolling: " + line);
    }
  }

  var timer;
  var lastText = "";

  return {
    perform: perform,
  };

  function onTick() {
    $("div.fyre-stream-more").trigger("click");    
    //console.log($("fyre-stream-more-container.fyre-spinner").is(":visible"));
    var article = $('.fyre-comment-stream article').last();
    var user = article.find(".fyre-comment-user").attr("data-from");
    var when = article.find("time").text();
    var text = user + " " + when;
    if (text != lastText) {
      console.log(user + " " + when);
      lastText = text;
    }
  }

  function onButtonClicked() {
    // fyre-stream-more-container
    console.log("onScrollingButtonClicked");
    if (!timer) {
      $("ffh-getmorecomments").text("Stop Getting Comments");
      timer = setInterval(onTick, 500);
    } else {
      $("ffh-getmorecomments").text("Get More Comments");
      clearInterval(timer);
      timer = undefined;
    }
  }

  // entry point to the module:
  //  state: true/false if module is enabled
  function perform(state, _loggingEnabled) {
    loggingEnabled = _loggingEnabled;
    log("perform " + state);

    log("installing");

    // add the tools div if not present
    addToolsDiv();

    // create a new button to control scrolling
    if (!$("#ffh-getmorecomments").length) {
      $("<button id='ffh-getmorecomments' style='margin-right: 20px;'>Get More Comments</button>")
        .appendTo("#ffh-tools")
        .click(onButtonClicked);
    }
  }
}