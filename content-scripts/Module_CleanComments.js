// module to clean comments
// - remove extra blank lines from comments
"use strict";

/* exported Module_CleanComments */
function Module_CleanComments() {

  String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
  };

  var loggingEnabled = true;
  var cleanBlankLines = false;
  var unboldPosts = false;
  var unboldPostsPct;
  var unupperPosts = false;
  var unupperPostsPct;
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
  function perform(enabled, _cleanBlankLines, 
                  _unboldPosts, _unboldPostsPct, 
                  _unupperPosts, _unupperPostsPct, 
                  _highlight, _highlightColor, _loggingEnabled) {
    loggingEnabled = _loggingEnabled;
    cleanBlankLines = _cleanBlankLines;
    unboldPosts = _unboldPosts;
    unboldPostsPct = isNaN(parseInt(_unboldPostsPct, 10)) ? 
      10 : parseInt(_unboldPostsPct, 10);
    unupperPosts = _unupperPosts;
    unupperPostsPct = isNaN(parseInt(_unupperPostsPct, 10)) ? 
      20 : parseInt(_unupperPostsPct, 10);    
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

  // function to remove bold from posts more than 10% bold
  function removeBold(comment) {
    var text = comment.text();
    var textLen = text.length;
    var bold = comment.find("strong").text();
    var boldLen = bold.length;
    var pct = (boldLen / textLen) * 100;
    if (pct > unboldPostsPct) {
      var html = comment.html();
      html = html.replaceAll("<strong>", "");
      html = html.replaceAll("</strong>", "");
      comment.html(html);
      return true;
    }

    return false;
  }

  function countLower(str) {
    var count = 0,
      len = str.length;
    for (var i = 0; i < len; i++) {
      if (/[a-z]/.test(str.charAt(i))) count++;
    }
    return count;
  }

  function countUpper(str) {
    var count = 0,
      len = str.length;
    for (var i = 0; i < len; i++) {
      if (/[A-Z]/.test(str.charAt(i))) count++;
    }
    return count;
  }

  function getTextNodesIn(el) {
    return $(el).find(":not(iframe)").addBack().contents().filter(function () {
      return this.nodeType == 3;
    });
  }

  // function to remove bold from posts more than 20% uppercase
  function removeUpper(comment) {
    var text = comment.text();
    var upr = countUpper(text);
    if (upr) {
      var lwr = countLower(text);
      var pct = (upr / (upr + lwr)) * 100;
      if (pct > unupperPostsPct) {
        log("upr: " + upr +
          " lwr: " + lwr +
          " pct" + pct + " " +
          text);
        var nodes = getTextNodesIn(comment);
        nodes.each(function () {
          this.textContent = this.textContent.toLowerCase();
        });
        return true;
      }
    }
    return false;
  }

  // function to clean a single comment
  function cleanComment(_elem) {
    var elem = $(_elem);
    var html0 = elem.html();

    if (cleanBlankLines) {     
      var html1 = html0.replaceAll("<br>", "");
      html1 = html1.replaceAll("<p></p>", "");
      html1 = html1.replaceAll("<p>.</p>", "");
      if (html0 != html1) {
        elem.html(html1);
      }

      elem.find("p").each(function (i, v) {
        var node = $(v);
        if (!processParagraph(node)) {
          v.remove();
        }
      });
    }

    if (unboldPosts) {
      removeBold(elem);
    }

    if (unupperPosts) {
      removeUpper(elem);
    }

    var html2 = elem.html()
    return html0 != html2;
  }

  function processComment(_comment) {
    var comment = $(_comment);
    var commentUser = comment.closest(".fyre-comment-wrapper").find(".fyre-comment-user").attr("data-from");

    // get the logged in user name if don't know
    if (!userName) {
      userName = getUserName();
      if (userName != "") {
        log("set userName to " + userName);
      }
    }

    // don't process comments from the logged in user
    if (userName && commentUser==userName) {
        log("skip comment from current user");
        return false;
    }

    var result = cleanComment(comment);

    if (result) {
      if (highlight && highlightColor != "") {
        comment.css("background-color", highlightColor);
      }
    }

    return result;
  }

  function processMutations(mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (_node) {
        var node = $(_node);
        var fyreComments = node.find(".fyre-comment");
        if (!fyreComments.length) {
          var temp = node.closest(".fyre-comment");
          if (temp.length == 1) {
            // note this will trigger a change when
            // the "edit in n minutes" text changes
            // a fix would be to check for that text
            fyreComments = temp;
          }
        }

        for (var i = 0; i < fyreComments.length; i++) {
          processComment(fyreComments[i]);
        }
      }, this);
    }, this);
  }
}