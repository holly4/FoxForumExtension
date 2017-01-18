// module to add borders around comments
"use strict";

function Module_Borderizer() {

  var loggingEnabled = true;
  var observerId = undefined;
  var targetUser = "HappyDaysAreHereAgain";

  return {
    perform: perform
  }

  function log(line) {
    if (loggingEnabled) {
      console.log("Borderizer: " + line);
    }
  }

  // is the module installed on the page?
  function isInstalled() {
    return observerId !== undefined;
  }

  // entry point to the module:
  //  enabled: true/false if module is enabled
  function perform(enabled, _loggingEnabled) {
    loggingEnabled = _loggingEnabled;
    log("perform " + enabled);

    if (enabled === isInstalled()) {
      // same as before. nothing to do
      return;
    }

    if (!enabled) {
      // disconnect observer
      log("disconnect observer: " + observerId);
      modules.commentObserver.detach(observerId);
      observerId = undefined;
    } else {

      $('head').append('<style> div.fyre span.fyre-comment-like-imgs { display: inline; } </style>');


      // connect to observer
      observerId = modules.commentObserver.attach(this, processMutations, false);
      log("attached to observer: " + observerId);

      // process any existing comments
      var fyreComments = $('.fyre-comment');
      for (var i = 0; i < fyreComments.length; i++) {
        processComment($(fyreComments[i]));
      }
    }
  }

  function processParagraph(node) {
    var text = node.text();

    if (text == "") {
      return false;
    }

    var nodes = node.find("*");
    if (nodes.length == 0) {
      var trimmed = text.trim();
      if (trimmed != text) {
        node.text = trimmed;
      }
    }

    return true;
  }

  // borderize a single comment
  function borderizeComment(elem) {
    var html = elem.html();
    //html = html.replaceAll("<p><p>", "<p>");
    //html = html.replaceAll("</p></p>", "</p>");
    html = html.replaceAll("<br>", "");
    html = html.replaceAll("<p></p>", "");
    html = html.replaceAll("<p>.</p>", "");
    elem.html(html);

    elem.find("p").each(function (i, v) {
      var node = $(v);
      if (!processParagraph(node)) {
        v.remove();
      }
    });
  }

  function processComment(_elem) {
    var elem = $(_elem);
    var user = elem.closest(".fyre-comment-wrapper").find(".fyre-comment-user").attr("data-from");
    if (user == targetUser) {
      var before = elem.html();
      borderizeComment(elem);
      var after = elem.html();
      if (before != after) {
        if (loggingEnabled) {
          console.log("fyreComment (before): " + before);
          console.log("fyreComment  (after): " + after);
        }
      }
    }
  }

  function processMutations(mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (_node) {
        var node = $(_node);
        var fyreComment = node.find(".fyre-comment");
        if (fyreComment.length) {
          processComment(fyreComment);
        }
      }, this);
    }, this);
  }
}