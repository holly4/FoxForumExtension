// the code to filter users comments

function Module_FilterUsers() {

  var observer = undefined;

  function log(line) {
    console.log("FilterUsers: " + line);
  }

  var users = [];
  var deletedComments = 0;

  return {
    perform
  };

  function isEnabled() {
    return observer !== undefined;
  }

  function perform(state, _users) {

    log("perform " + state + ", " + _users);

    // always copy users if active
    // TODO: detect a new filtered user and remove all posts
    if (state) {
      users.splice(0);
      _users.forEach(function(user) {
        users.push(user)
      });
    }

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
      var root = $('#livefyre_comment_stream');
      observer.observe(root[0], {
        childList: true,
        subtree: true,
      });
    }
  }

  function processMutations(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(_node) {
        //console.log('added: ' + _node.tagName + " " + _node.getAttribute("class"));
        var node = $(_node);
        if (node.hasClass('fyre-comment-article')) {
          var wrapper = node.find('.fyre-comment-wrapper'); 
          var author = wrapper.find('.fyre-comment-username').text().trim();
          //console.log('author = ' + author);
          if (jQuery.inArray(author, users) >= 0) {
            wrapper.remove();
            //console.log("removed comment from " + author);
            deletedComments++;
          }
        }
      });
    });
  }
}