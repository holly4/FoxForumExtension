"use strict";

// module to restore filterred comments
// TODO: When cancel delete all displayed filtered comments

function Module_ShowFilteredComments() {

  var loggingEnabled = false;
  var observerId = undefined;
  var highlight = false;
  var highlightColor = undefined;
  var userName = undefined;

  return {
    perform: perform,
  };

  function log(line) {
    if (loggingEnabled) {
      console.log("ShowFilteredComments: " + line);
    }
  }

  // is the module installed on the page?
  function isInstalled() {
    return observerId !== undefined;
  }

  // entry point to the module:
  //  state: true/false if module is enabled
  function perform(state, _highlight, _highlightColor, _loggingEnabled) {
    loggingEnabled = _loggingEnabled;
    log("perform " + state);

    if (state === isInstalled()) {
      // same state as before. nothing to do
      return;
    }

    if (!state) {
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
    }

    // show the comment unless from the current user
    function showPost(target) {
      // if don't know user then determine it
      if (!userName) {
        userName = getUserName();
        if (userName != "") {
          log("set userName to " + userName);
        }
      }

      // if logged in user see if it matches
      if (userName) {
        var commentUser = target.find(".fyre-comment-user").attr("data-from");
        if (userName == commentUser) {
          log("do not show post from " + commentUser);
          return;
        }
      }

      // show the post
      log("show post from " + commentUser);
      target.show();

    }

    function processMutations(mutations) {
      // process each mutation indivudually.
      // this may or may not be needed depending on how the mutations are grouped
      // i.e., it guarenteed that all mutations for deleting a comment are bunched into
      // one larger mutation?
      mutations.forEach(function (mutation) {

        var target = $(mutation.target);

        //console.log(mutation.target.tagName + ": mutation.type: " + mutation.type);

        // handle attribute mutation
        if (mutation.type == "attributes") {
          //console.log("attributeName: " + mutation.attributeName +
          //  " = " + target.attr(mutation.attributeName));

          // remove fyre-comment-hidden
          if (target.hasClass('fyre-comment-hidden')) {
            target.removeClass('fyre-comment-hidden');
            //log("remove fyre-comment-hidden");
          }
        }

        // restore various nodes
        mutation.removedNodes.forEach(function (_entry) {
          var entry = $(_entry);
          if (entry.hasClass('fyre-comment-user')) {
            target.append(entry);
            //log("restore fyre-comment-user: ");
          }
          if (entry.hasClass('fyre-comment-head')) {
            target.append(entry);
            //log("restore fyre-comment-head");
          }
          if (entry.hasClass('fyre-comment-body')) {
            target.append(entry);
            //log("restore fyre-comment-body");
            target.find('section.fyre-comment-deleted').remove();
            if (highlight && highlightColor != "") {
              target.css('background-color', highlightColor);
              showPost(target);
            }
          }

        });
      });
    }
  }
}