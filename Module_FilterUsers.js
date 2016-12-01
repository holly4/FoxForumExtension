// the code to filter users comments

function Module_FilterUsers() {

  var observerId = undefined;

  function log(line) {
    console.log("FilterUsers: " + line);
  }

  var users = [];
  var filteredByUser = [];
  var totalFilteredPosts = 0;

  return {
    perform
  };

  // module is enabled if the observer has been created
  function isEnabled() {
    return observerId !== undefined;
  }

  // return the id from a user
  function idFromUser(user) {
    return "user_" + user + "_count";
  }

  function updateUsers(_users) {
    // add filtered users table if not present on page
    if ($('#filteredByUser').length === 0) {
      $('.fyre-stream-header').append(
        "<table id='filteredByUser'><thead></thead><tbody></tbody</table>");
      var tr = "<tr><td>Total Filtered Posts</td><td id='totalFilteredPosts'>0</td></lr>";
      $('#filteredByUser tbody').append(tr);        
    }

    // remove users no longer filtered
    users.forEach(function (user) {
      if (!_users.includes(user)) {
        var node = $('#' + idFromUser(user)).parent().remove();
      }
    });
    users = users.filter(function (i) {
      return _users.includes(i);
    });

    // add in users not present before
    _users.forEach(function (user) {
      if (!users.includes(user)) {
        users.push(user);
        filteredByUser[user] = 0;
        removePostsBy(user);
      }
    });
  }

  // remove all present posts by user
  function removePostsBy(user) {
    var comments = $('#livefyre_comment_stream .fyre-comment-wrapper');
    comments.each(function () {
      var author = $(this).find('.fyre-comment-username').text().trim();
      if (author === user) {
        $(this).remove();
        updateUserCount(user, 1);
      }
    });
  }

  // update the filter count for a user inserting in table if needed
  function updateUserCount(user, delta) {
    var userTotal = (filteredByUser[user] += delta);

    if ($('#' + idFromUser(user)).length === 0) {
      var tr = "<tr><td>" + user + "</td><td id=" + idFromUser(user) + ">0</td></lr>";
      $('#filteredByUser tbody').append(tr);
    }
    $('#' + idFromUser(user)).text(userTotal);
    $('#totalFilteredPosts').text(totalFilteredPosts += delta);
  }

  // entry point to the module:
  //  state: true/false if module is enabled
  //  _users: string array of users to filter
  function perform(state, _users) {

    log("perform " + state + ", " + _users);

    // always copy users if active as user list can be updated by user
    if (state) {
      updateUsers(_users);
    }

    var enabled = isEnabled();

    if (state === enabled) {
      // same state as before. nothing to do
      return;
    }

    if (!state) {
      // disconnect observer
      log("disconnect observer " + observerId);
      modules.commentObserver.detach(observerId);
      observerId = undefined;
      // remove filtered users table
      $('.filteredByUserTable').remove();
    } else {
      // connect to observer
      observerId = modules.commentObserver.attach(false, processMutations);
      log("added observer" + observerId);
    }
  }

  function processMutations(mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (_node) {
        var node = $(_node);
        if (node.hasClass('fyre-comment-article')) {
          var wrapper = node.find('.fyre-comment-wrapper');
          var author = wrapper.find('.fyre-comment-username').text().trim();
          if (users.includes(author)) {
            wrapper.remove();
            updateUserCount(author, 1);
          }
        }
      });
    });
  }
}