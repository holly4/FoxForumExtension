// module to clean comments
"use strict";

/* exported Module_CleanComments */
function Module_CleanComments() {

  String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
  };

  var loggingEnabled = false;
  var observerId = undefined;
  let hideTopActivityBar = false;
  let hideReplyActivityBar = false;
  let settings = {};

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
  function perform(parm) {
    settings = parm;
    loggingEnabled = settings.get(loggingEnabled);

    console.log('CleanComments',
      ' hideTopActivityBar:', settings.get('hideTopActivityBar'),
      ' hideReplyActivityBar:', settings.get('hideReplyActivityBar'));

    hideTopActivityBar = settings.getOrSet('hideTopActivityBar', false);
    hideReplyActivityBar = settings.getOrSet('hideReplyActivityBar', false);

    showTopActivityBar(!hideTopActivityBar);
    showReplyActivityBar(!hideReplyActivityBar);

    addHeader($('#ffh-div'), "Hide Top Activity Bar", hideTopActivityBar, function (state) {
      hideTopActivityBar = state;
      showTopActivityBar(!hideTopActivityBar);
      settings.set('hideTopActivityBar', hideTopActivityBar);
    });

    addHeader($('#ffh-div'), "Hide Reply Activity Bar", hideReplyActivityBar, function (state) {
      hideReplyActivityBar = state;
      showReplyActivityBar(!hideReplyActivityBar);
      settings.set('hideReplyActivityBar', hideReplyActivityBar);
    });

    // connect to observer
    observerId = modules.commentObserver.attach(this, processMutations);
    log("attached to observer: " + observerId);

    // handle existing comments
    let comments = modules.commentObserver.scan();
    $.each(comments, function (index, value) {
      processComment(value);
    });
  }

  function addHeader($container, text, _state, set_state) {
    let state = _state;
    let $div = $('<div>')
      .appendTo($container)
      .css('margin-top', '.5em;')
      .css('margin-left', '1em');

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
      .css('margin-left', '.5em')
      .text(text);
  }

  function showTopActivityBar(show) {
    let elem = $('.sppre_top-activity-bar .sppre_message-section');
    show ? elem.show() : elem.hide();
  }

  function showReplyActivityBar(show, $node) {
    if ($node) {
      hideReplyActivityBar ? $node.parent().hide() : $node.parent().show();
    } else {
      let $bars = $('.sppre_conversation-typing');
      $bars = $bars.filter(function (index) {
        let filter = index == 0 && $(this).closest('.sppre_top-activity-bar').length;
        return !filter;
      });
      show ? $bars.show() : $bars.hide();
    }
  }

  function processComment(comment) {
    let target = $(comment.element).find('.sppre_message-context-menu .sppre_icon');
    target.find('g').attr("fill", 'powderblue');
  }

  function processMutations(mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.hasOwnProperty("userName")) {
        processComment(mutation);
      } else if (mutation.hasOwnProperty("node")) {
        let $node = $(mutation.node);

        let top = $node.hasClass('sppre_top-activity-bar');
        if (top) {
          showTopActivityBar(!hideTopActivityBar);
        }

        let $inner = $node.find('.sppre_conversation-typing');
        if ($inner.length) {
          showReplyActivityBar(!hideTopActivityBar, $inner);
        }
      }
    });
  }
}