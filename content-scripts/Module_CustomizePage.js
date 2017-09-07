"use strict";

/* exported Module_CustomizePage */
function Module_CustomizePage() {

  var loggingEnabled = false;
  return {
    perform: perform,
  };

  function log(line) {
    if (loggingEnabled) {
      console.log("CustomizePage: " + line);
    }
  }

  // is the module installed on the page
  function isInstalled() {
    var len = $('#btnToggleArticle').length;
    var result = len > 0;
    log("isInstalled: " + result + "(" + len + ")");
    return result;
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

  // add a link to online help if not present
  function addFoxForumsInfoLink(text) {

    if (!$("#ffi-link").length) {
      $("<div id='ffi-link' style='float:right;vertical-align:middle;margin-top:-5px' ></div>")
        .insertBefore("#livefyre_comment_stream .fyre-stream-header");

      var url = "http://foxforums.info"

      var link = $(" \
                <a style='margin-right: 20px;color: \
                #0000FF;font-size: 12px;' target='_blank'></a>");
      link.appendTo("#ffi-link");
      link.text(text);
      link.attr("href", url);
    }
  }

  // install - install the feature
  function install(customLinkTitle, customLinkUrl) {
    var pageFormat = 0;

    if ($('#content .main').length) {
      pageFormat = 1;
    } else if ($('div .page-content').length) {
      pageFormat = 2;
    } else {
      //alert("unknown article format: cannot clean page");
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

    if (pageFormat == 2) {
      // set the formum text size
      $('head').append('<style> .fyre .fyre-comment p { font-size: 17px; } </style>');
    }

    // add custom link
    if (customLinkTitle && customLinkTitle != "" &&
      customLinkUrl && customLinkUrl != "") {
      addCustomLink(customLinkTitle, customLinkUrl);
    }

    addHelpLink("Help for Fox Forum Helper");
    addFoxForumsInfoLink("FoxForums.info");
  }

  // entry point to the module:
  //  state: true/false if module is enabled
  function perform(
    _loggingEnabled,
    customLinkTitle, customLinkUrl) {
    loggingEnabled = _loggingEnabled;
    if (!isInstalled()) {
      install(customLinkTitle, customLinkUrl);
    }
  }
}