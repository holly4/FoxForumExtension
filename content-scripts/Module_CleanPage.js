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

  // install - install the feature
  function install(removeMasthead, removeVideo, customLinkTitle, customLinkUrl) {

    removeSiblings('#wrapper', '#templateHolder', 'janrain');

    if (removeMasthead) {
      removeSiblings('#doc');
    } else {
      removeSiblings('#doc', "notdef", 'masthead ');
    }

    removeSiblings('#content .main');
    removeSiblings('#commenting', 'article');
    $(".freeform").remove();

    if (removeVideo) {
      $(".video-container").remove();
    }

    // enable the hidden comment count
    $('#livefyre_comment_stream .fyre-stream-stats').css('display', 'inline');

    // change font on main username display to distinguish I's from l's
    $(".fyre-user-profile-link span").css("font-family", '"Tahoma"');

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
    $('article').first().hide();

    // add custom link
    if (customLinkTitle && customLinkTitle != "" &&
      customLinkUrl && customLinkUrl != "") {
      addCustomLink(customLinkTitle, customLinkUrl);
    }

    // add buttons div
    $('#content .main').prepend("<div id='ffhButtons'>");

    // add button to toggle article display
    $('#ffhButtons').append("<button id='toggleArticle'>Show Article</button>");
    $('#toggleArticle').css('margin', '20px 20px 0px 0px');
    $('#toggleArticle').click(function () {
      if ($(this).text() == 'Show Article') {
        $('article').first().show();
        $(this).text('Hide Article');
        $(this).css('margin-bottom', '20px');
      } else {
        $('article').first().hide();
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