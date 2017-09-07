"use strict";

/* exported Module_CleanPage */
function Module_CleanPage() {

  var loggingEnabled = false;

  return {
    perform: perform,
  };

  function log(line) {
    if (loggingEnabled) {
      console.log("CleanPage: " + line);
    }
  }

  // is the module installed on the page
  function isInstalled() {
    var len = $('#btnToggleArticle').length;
    var result = len > 0;
    log("isInstalled: " + result + "(" + len + ")");
    return result;
  }

  //  removeSiblings - remove siblings of selector
  //    filter: selector of siblings not to remove
  //    exclude: exclude siblings with this text in tag, id, or class
  function removeSiblings(selector, filter, exclude) {
    if ($(selector).find("#livefyre_comment_stream").length > 0) {
      // alert("Attemt to remove forum!");
      // never remove the forum!
      return;
    }

    var toRemove = filter ?
      $(selector).siblings().not(filter) : $(selector).siblings();

    toRemove.each(function (i, val) {
      var _this = $(val);
      var tag = val.nodeName.toLowerCase();
      var _id = $(val).attr('id');
      var _class = $(val).attr('class');
      var tag_id_class = tag + " id='" + _id + "' class='" + _class + "'";
      if (!exclude || !tag_id_class.includes(exclude)) {
        _this.remove();
      }
    });
  }

  function hideArticle() {
    if ($("div .article-content").length) {
      $("div .article-content").hide();
    } else {
      $('article').first().hide();
    }
  }

  function showArticle() {
    if ($("div .article-content").length) {
      $("div .article-content").show();
    } else {
      $('article').first().show();
    }
  }

  // install - install the feature
  function install(removeMasthead, removeVideo) {
    var pageFormat = -1;
    var selector = "";

    if ($('#content .main').length) {
      pageFormat = 1;
      selector = '#content .main';
    } else if ($('div .page-content').length) {
      pageFormat = 2;
      selector = 'div .page-content';
    } else {
      alert("unknown article format: cannot clean page");
    }

    removeSiblings('#wrapper', '#templateHolder', 'janrain');

    if (removeMasthead) {
      removeSiblings('#doc');
    } else {
      removeSiblings('#doc', "notdef", 'masthead ');
    }

    removeSiblings(selector);
    removeSiblings('#commenting', 'article');
    $(".freeform").remove();

    // addtional cleaning for alernate article format
    $(".outbrain").remove();
    $("header > .meta").remove();
    $("header > .social-count").remove();
    $(".article-sidebar").remove();
    $(".site-footer").remove();
    $(".pre-content").remove();

    if (removeVideo) {
      $(".video-container").remove();
    }

    hideArticle();

    // add buttons div
    if (pageFormat == 1) {
      $(selector).prepend("<div id='ffhButtons'>");
    } else if (pageFormat == 2) {
      $("header.article-header").prepend("<div id='ffhButtons'>");
    }

    // add button to toggle article display
    $('#ffhButtons').append("<button id='toggleArticle'>Show Article</button>");
    if (pageFormat == 1) {
      $('#toggleArticle').css('margin', '20px 20px 0px 0px');
    } else if (pageFormat == 2) {
      $('#toggleArticle').css('margin', '20px 20px 20px 0px');
    }

    $('#toggleArticle').click(function () {
      if ($(this).text() == 'Show Article') {
        showArticle();
        $(this).text('Hide Article');
        $(this).css('margin-bottom', '20px');
      } else {
        hideArticle();
        $(this).text('Show Article');
        $(this).css('margin-bottom', '0px');
      }
    });
  }

  // entry point to the module:
  //  state: true/false if module is enabled
  function perform(
    state, removeMasthead, removeVideo, _loggingEnabled) {
    loggingEnabled = _loggingEnabled;
    log("perform " + state);

    if (!state) {
      // this cannot be undone
    } else {
      if (!isInstalled()) {
        install(removeMasthead, removeVideo);
      }
    }
  }
}