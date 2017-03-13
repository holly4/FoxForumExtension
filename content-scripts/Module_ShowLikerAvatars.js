"use strict";

// module to enable the display of liker avatars

/* exported Module_ShowLikerAvatars */
function Module_ShowLikerAvatars() {

  var loggingEnabled = true;

  return {
    perform: perform,
  };


  function log(line) {
    if (loggingEnabled) {
      console.log("ShowLikerAvatars: " + line);
    }
  }

  // is the module installed on the page?
  function isInstalled() {
    return $('div.fyre span.fyre-comment-like-imgs').first().css('display') !== "none";
  }

  // entry point to the module:
  //  state: true/false if module is enabled
  function perform(state, _loggingEnabled) {
    loggingEnabled = _loggingEnabled;
    log("perform " + state);

    if (state === isInstalled()) {
      // same state as before. nothing to do
      return;
    }

    // this will keep appending new style elements to the <head> element
    // as the extension is enabled and disabled.
    // TODO: a better approach would be to add an id tag to the style and 
    // delete it on disable. Question being would this then be noticed by
    // present elements?
    if (state) {
      $('head').append('<style> div.fyre span.fyre-comment-like-imgs { display: inline; } </style>');
    } else {
      $('head').append('<style> div.fyre span.fyre-comment-like-imgs { display: none; } </style>');
    }
  }
}