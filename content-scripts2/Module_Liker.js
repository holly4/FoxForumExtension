// module to like comments
"use strict";

/* exported Module_LikeComments */
function Module_LikeComments() {

  var loggingEnabled = false;

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
  function perform(settings) {
    loggingEnabled = settings.loggingEnabled;
    log("installed");

    // handle existing comments
    var comments = modules.commentObserver.scan();
    var voted = false;
    $.each(comments, function (index, value) {
      if (!voted) {
        voted = processComment(value);
      }
    });
  }

  function processComment(comment) {
    let $element = $(comment.element);
    var $vote = $element.find('.sppre_vote-up-icon.sppre_active').first();
    if ($vote.length) {
      simulatedClick($vote[0]);
      return true;
    }
    return false;
  }

  function simulatedClick(target, _options) {

    var event = target.ownerDocument.createEvent('MouseEvents'),
      options = _options || {},
      opts = { // These are the default values, set up for un-modified left clicks
        type: 'click',
        canBubble: true,
        cancelable: true,
        view: target.ownerDocument.defaultView,
        detail: 1,
        screenX: 0, //The coordinates within the entire page
        screenY: 0,
        clientX: 0, //The coordinates within the viewport
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
        button: 0, //0 = left, 1 = middle, 2 = right
        relatedTarget: null,
      };

    //Merge the options with the defaults
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        opts[key] = options[key];
      }
    }

    //Pass in the options
    event.initMouseEvent(
      opts.type,
      opts.canBubble,
      opts.cancelable,
      opts.view,
      opts.detail,
      opts.screenX,
      opts.screenY,
      opts.clientX,
      opts.clientY,
      opts.ctrlKey,
      opts.altKey,
      opts.shiftKey,
      opts.metaKey,
      opts.button,
      opts.relatedTarget
    );

    //Fire the event
    target.dispatchEvent(event);
  }

}