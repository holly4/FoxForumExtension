"use strict";

/* exported Module_CleanPage */
function Module_CleanPage() {

  var loggingEnabled = false;
  var pageFormat = -1;
  var selector = "";

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

  // add a link to the Unicode Converter if not present
  function addCustomLink(text, url) {
    addToolsDiv();

    if (!$("#customLink").length) {
      var link = $(" \
            <a id='customLink' style='margin-right: 20px;color: \
            #0000FF;font-size: 12px;' target='_blank'></a>");
      link.appendTo("#ffh-tools");
      link.text(text);
      link.attr("href", url);
    }
  }

    // add a link to online help if not present
  function addHelpLink(text) {
  
    if (!$("#ffh-help").length) {
        $("<div id='ffh-help' style='float:right;vertical-align:middle;margin-top:-5px' ></div>")
            .insertBefore("#livefyre_comment_stream .fyre-stream-header");

      const _browser = window.browser ? window.browser : window.chrome;
      var manifest = _browser.runtime.getManifest();
      var url = "http://hollies.pw/static/ffh/" + manifest.version + "/help/"

      var link = $(" \
            <a style='margin-right: 20px;color: \
            #0000FF;font-size: 12px;' target='_blank'></a>");
      link.appendTo("#ffh-help");
      link.text(text);
      link.attr("href", url);
    }
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
  function install(removeMasthead, removeVideo, customLinkTitle, customLinkUrl) {

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

    // enable the hidden comment count
    $('#livefyre_comment_stream .fyre-stream-stats').css('display', 'inline');

    // remove extra padding at the top
    $("#doc").each(function () {
      this.style.setProperty('padding', '0px', 'important');
    });

    $(".main").each(function () {
      this.style.setProperty('padding-top', '0px', 'important');
    });

    $("#commenting").each(function () {
      this.style.setProperty('padding', '0px', 'important');
    });

    // fix issue in Fox News CSS where the main editor and the user avatar overlap making
    // it imposible to select with the mouse the first dozen or so letters in a comment
    $('#livefyre_comment_stream .fyre-editor').first().css('padding-top', 16);

    if (pageFormat==2) {
      // set the formum text size
      $('head').append('<style> .fyre .fyre-comment p { font-size: 17px; } </style>');
    }

    hideArticle();

    // add custom link
    if (customLinkTitle && customLinkTitle != "" &&
      customLinkUrl && customLinkUrl != "") {
      addCustomLink(customLinkTitle, customLinkUrl);
    }

    addHelpLink("Help for Fox Forum Helper");


    // add buttons div
    if (pageFormat==1) {
      $(selector).prepend("<div id='ffhButtons'>");
    } else if (pageFormat==2) {
      $("header.article-header").prepend("<div id='ffhButtons'>");
    }

    // add button to toggle article display
    $('#ffhButtons').append("<button id='toggleArticle'>Show Article</button>");
    if (pageFormat==1) {
      $('#toggleArticle').css('margin', '20px 20px 0px 0px');
    } else if (pageFormat==2) {
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
    state, removeMasthead, removeVideo, _loggingEnabled,
    customLinkTitle, customLinkUrl) {
    loggingEnabled = _loggingEnabled;
    log("perform " + state);

    if (!state) {
      // this cannot be undone
    } else {
      if (!isInstalled()) {
        install(removeMasthead, removeVideo, customLinkTitle, customLinkUrl);
      }
    }
  }
}