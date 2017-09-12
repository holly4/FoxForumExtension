// module to clean comments
"use strict";

/* exported Module_CleanComments */
function Module_CleanComments() {

  String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
  };

  var loggingEnabled = false;
  var observerId = undefined;
  //let showTopActivityBar = true;
  //let showReplyActivityBar = true;

  return {
    perform: perform
  }

  function log(line) {
    if (loggingEnabled) {
      console.log("CleanComments: " + line);
    }
  }

  // entry point to the module:
  //  enabled: true/false if module is enabled
  function perform(_loggingEnabled) {
    loggingEnabled = _loggingEnabled;

    /*
    addHeader($('#ffh-div'), "Show Top Activity Bar", showTopActivityBar, function (state) {
      showTopActivityBar = state;
      let elem = $('.sppre_top-activity-bar');
      if (state) {
        elem.show();
      }
      else {
        elem.hide();
      }
    });
    

    //addHeader($('#ffh-div'), "Show Reply Activity Bar", showReplyActivityBar, function (state) {
    //  showReplyActivityBar = state;
    //});

    function addHeader($container, text, state, set_state) {
      let $div = $('<div>')
        .appendTo($container);

      $('<img>')
        .appendTo($div)
        .attr('src', state ? checkedBox : checkBox)
        .css('height', iconSize)
        .css('width', iconSize)
        .click(function () {
          state = !state;
          set_state(state);
          $(this).attr('src', state ? checkedBox : checkBox);
        });

      $('<span>')
        .appendTo($div)
        .css('margin-left', '10px')
        .text(text);
    }*/

    // connect to observer
    observerId = modules.commentObserver.attach(this, processMutations);
    log("attached to observer: " + observerId);

    // handle existing comments
    var comments = modules.commentObserver.scan();
    $.each(comments, function (index, value) {
      processComment(value);
    });
  }

  function processComment(comment) {
    var target = $(comment.element).find('.sppre_message-context-menu .sppre_icon');
    target.find('g').attr("fill", 'powderblue');
  }

  function processMutations(mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.hasOwnProperty("userName")) {
        processComment(mutation);
      } /*else {
        let $element = $(mutation.element);
        let $msg = $element.find('.sppre_conversation-typing');
        if ($msg.length) {
          let $top = $element.find('.sppre_top-activity-bar');
          if ($top.length) {
            if (!showTopActivityBar) {
              $top.hide();
            }
          } else {
            if (!showReplyActivityBar) {
              $msg.hide();
            }
          }
        
      }}*/
    });
  }
}