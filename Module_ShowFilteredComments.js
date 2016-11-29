// module to restore filterred comments
// TODO: When cancel delete all displayed filtered comments

function Module_ShowFilteredComments() {

  var observer = undefined;

  function log(line) {
    console.log("ShowFilteredComments: " + line);
  }

  return {
    perform
  }

  function isEnabled() {
    return observer !== undefined;
  }

  function perform(state) {
    log("perform " + state);

    var enabled = isEnabled();

    if (state === enabled) {
      // same state as before. nothing to do
      return;
    }

    if (!state) {
      if (enabled) {
        // disconnect observer
        log("disconnect observer");
        observer.disconnect();
        observer = undefined;
      }
    } else {
      log("create observer");
      // create observer
      observer = new MutationObserver(processMutations);
      // start the observer on the comment stream
      var root = $('.fyre-comment-stream');
      observer.observe(root[0], {
        attributes: true,
        childList: true,
        subtree: true,
        attributeOldValue: true,
        // don't need character data notifications
        characterDataOldValue: false,
        characterData: false,
      });
    }

    function processMutations(mutations) {
      // process each mutation indivudually.
      // this may or may not be needed depending on how the mutations are grouped
      // i.e., it guarenteed that all mutations for deleting a comment are bunched into
      // one larger mutation?
      mutations.forEach(function(mutation) {

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
            //console.log("show comment");
            $(mutation.target).show();
          }
        }

        // remove .fyre-comment-hidden
        if (mutation.type == "attributes") {
          if ($(mutation.target).hasClass('fyre-comment-hidden')) {
            //console.log("remove class fyre-comment-hidden");
            $(mutation.target).removeClass('fyre-comment-hidden');
          }
        }

        // restore various nodes
        mutation.removedNodes.forEach(function(entry) {
          if ($(entry).hasClass('fyre-comment-user')) {
            //console.log("restore fyre-comment-user");
            $(mutation.target).append(entry);
          }
          if ($(entry).hasClass('fyre-comment-head')) {
            console.log("restore fyre-comment-head");            
            $(mutation.target).append(entry);
          }
          if ($(entry).hasClass('fyre-comment-body')) {
            //console.log("restore fyre-comment-body");   
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