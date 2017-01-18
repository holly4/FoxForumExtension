// module to clean comments
// - remove extra blank lines from comments
"use strict";

function Module_CleanComments() {

  String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
  };

  var loggingEnabled = true;
  var observerId = undefined;
  var userName = undefined;
  var highlight = false;
  var highlightColor = undefined;

  return {
    perform: perform
  }

  function log(line) {
    if (loggingEnabled) {
      console.log("CleanComments: " + line);
    }
  }

  // is the module installed on the page?
  function isInstalled() {
    return observerId !== undefined;
  }

  // entry point to the module:
  //  enabled: true/false if module is enabled
  function perform(enabled, _highlight, _highlightColor, _loggingEnabled) {
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
      highlight = _highlight;
      highlightColor = _highlightColor;

      // connect to observer
      observerId = modules.commentObserver.attach(this, processMutations, false);
      log("attached to observer: " + observerId);

      // process any existing comments
      var fyreComments = $('.fyre-comment');
      for (var i = 0; i < fyreComments.length; i++) {
        processComment(fyreComments[i]);
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

  // function to clean a single comment
  function cleanComment(_elem) {
    // get the logged in user name if don't know
    if (!userName) {
      var fyreUserDrop = $(".fyre-user-drop");
      if (fyreUserDrop.length) {
        userName = fyreUserDrop.text();
        log("set userName to " + userName);
      }
    }

    var elem = $(_elem);

    // don't process comments from the logged in user
    if (userName) {
      var commentUser = elem.closest(".fyre-comment-wrapper").find(".fyre-comment-user").attr("data-from");
      if (userName == commentUser) {
        log("skip comment from current user");
        return;
      }
    }

    var html = elem.html();
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

  function processComment(_comment) {
    var comment = $(_comment);
    var html0 = comment.html();
    //var text0 = comment.text();
    //var height0 = comment.height();

    cleanComment(comment);

    var html1 = comment.html();
    //var text1 = comment.text();
    //var height1 = comment.height();    

    if (html0 != html1 /*|| height0 != height1 || text0 != text1 */) {
      if (highlight && highlightColor != "") {
        comment.css("background-color", highlightColor);
        log(comment.html());
        /*comment.empty();
        $("<div>" + html0 + "</div>").appendTo(comment)
          .css("background-color", "#ccffcc");
        $("<div>" + html1 + "</div>").appendTo(comment)
          .css("background-color", "#ccccff");*/
      }

      if (loggingEnabled) {
        var byHeight = "h";
        var byText = "t";
        if (height0 != height1) {
          byHeight = "H";
        }
        if (text0 != text1) {
          byText = "T";
        }        
        console.log("fyreComment " + byHeight + byText + " (before): " + html0);
        console.log("fyreComment " + byHeight + byText + " (after): " + html1);
      }
    }
  }

  function processMutations(mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (_node) {
        var node = $(_node);
        var fyreComments = node.find(".fyre-comment");
        for (var i=0; i<fyreComments.length; i++) {
          processComment(fyreComments[i]);
        }
      }, this);
    }, this);
  }
}