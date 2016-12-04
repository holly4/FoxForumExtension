// module to restore filterred comments
// TODO: When cancel delete all displayed filtered comments

function Module_ShowFilteredComments() {

  var loggingEnabled = false;
  var observerId = undefined;

  return {
    perform
  }

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
  function perform(state, _loggingEnabled) {
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
      // connect to observer
      observerId = modules.commentObserver.attach(false, processMutations);
      log("attached to observer: " + observerId);
    }

    function processMutations(mutations) {
      // process each mutation indivudually.
      // this may or may not be needed depending on how the mutations are grouped
      // i.e., it guarenteed that all mutations for deleting a comment are bunched into
      // one larger mutation?
      mutations.forEach(function (mutation) {

        // this would restore the liker images but must then restore the 
        // comment footer too. But filtered comments usually have no likes.
        // mutation.removedNodes.forEach(function(entry) {
        //    if ($(entry).hasClass('fyre-comment-like-imgs')) {
        //        $(mutation.target).append(entry);
        //    }
        //});

        // show the comment 
        if (mutation.type == "attributes") {
          if ($(mutation.target).hasClass('fyre-comment-wrapper')) {
            $(mutation.target).show();
          }
        }

        // remove .fyre-comment-hidden
        if (mutation.type == "attributes") {
          if ($(mutation.target).hasClass('fyre-comment-hidden')) {
            $(mutation.target).removeClass('fyre-comment-hidden');
          }
        }

        // restore various nodes
        mutation.removedNodes.forEach(function (entry) {
          if ($(entry).hasClass('fyre-comment-user')) {
            $(mutation.target).append(entry);
          }
          if ($(entry).hasClass('fyre-comment-head')) {
            $(mutation.target).append(entry);
          }
          if ($(entry).hasClass('fyre-comment-body')) {
            var target = $(mutation.target);
            target.append(entry);
            target.find('section.fyre-comment-deleted').remove();
            target.css('background-color', '#ffcccc');
          }

          // do not restore footer as cannot like a deleted comment
          //if ($(entry).hasClass('fyre-comment-footer')) {
          //    $(mutation.target).append(entry);
          //}                        
        });
      });
    }
  }
}