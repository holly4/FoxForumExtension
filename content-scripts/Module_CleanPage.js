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
  function addUnicodeConverterLink() {
    addToolsDiv();
    
    if (!$("#unicodeConverter").length) {
      var link = $(" \
            <a id='unicodeConverter' style='margin-right: 20px;color: #0000FF;font-size: 12px;' \
                href='http://holly4.github.io/UnicodeConverter' \
                            target='_blank'>Unicode Converter \
            </a>");
      link.appendTo("#ffh-tools");
    }
  }

  // install - install the feature
  function install(removeVideo) {
    removeSiblings('#wrapper', '#templateHolder', 'janrain');
    removeSiblings('#doc');
    removeSiblings('#content .main');
    removeSiblings('#commenting', 'article');
    $(".freeform").remove();

    if (removeVideo) {
      $(".video-container").remove();
    }

    // enable the hidden comment count
    $('#livefyre_comment_stream .fyre-stream-stats').css('display', 'inline');

    // remove extra padding at the top
    $("#doc").each(function () {
      this.style.setProperty( 'padding', '0px', 'important' );
    });

    $(".main").each(function () {
      this.style.setProperty( 'padding-top', '0px', 'important' );
    });

    $("#commenting").each(function () {
      this.style.setProperty( 'padding', '0px', 'important' );
    });

    // fix issue where the main editor and the user avatar overlap making
    // it imposible to select with the mouse the first dozen or so letters in a comment
    $('#livefyre_comment_stream .fyre-editor').first().css('padding-top', 16);
    $('article').first().hide();

    // add a link to the Unicode Converter
    addUnicodeConverterLink();

    // add button to toggle article display
    // TODO: Add to commmon buttons div
    $('#content .main').prepend("<button id='toggleArticle'>Show Article</button><br>");
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
  function perform(state, removeVideo, _loggingEnabled) {
    loggingEnabled = _loggingEnabled;
    log("perform " + state);

    if (!state) {
      // this cannot be undone
    } else {
      if (!isInstalled()) {
            install(removeVideo);
      }
    }
  }
}