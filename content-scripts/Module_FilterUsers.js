"use strict";

// the code to filter users comments
// (ಠ_ಠ)┌∩┐

function Module_FilterUsers() {

  var loggingEnabled = false;
  var observerId = undefined;
  var users = [];
  var filteredByUser = [];
  var totalFilteredPosts = 0;

  return {
    perform: perform,
  };


  function log(line) {
    if (loggingEnabled) {
      console.log("FilterUsers: " + line);
    }
  }

  // is the module installed on the page?
  function isInstalled() {
    return observerId !== undefined;
  }

  // return the id for a user
  function idFromUser(user) {
    return "user_" + user + "_count";
  }

  function updateUsers(_users) {
    // add filtered users table if not present on page
    if ($('#filteredByUser').length === 0) {
      $('#livefyre_comment_stream .fyre-stream-header').append(
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
  function perform(state, _loggingEnabled, _users) {
    loggingEnabled = _loggingEnabled;
    log("perform " + state + ", " + _users);
    var showDiagnostics = false;

    // always copy users if active as user list can be updated by user
    if (state) {
      updateUsers(_users);
    }

    if (state === isInstalled()) {
      // same state as before. nothing to do
      return;
    }

    if (!state) {
      // disconnect observer
      log("disconnect observer: " + observerId);
      modules.commentObserver.detach(observerId);
      observerId = undefined;
      // remove filtered users table
      $('#filteredByUser').remove();
    } else {
      // connect to observer
      observerId = modules.commentObserver.attach(this, processMutations, false);
      log("attached to observer: " + observerId);
    }

    if (showDiagnostics) {
      // add the tools div if not present
      addToolsDiv();

      // create a new button to test the filter
      if (!$("#ffh-validate-filter").length) {
        $("<button id='ffh-validate-filter' style='margin-right: 20px;'>Validate Filter</button>")
          .appendTo("#ffh-tools")
          .click(function () {
            onValidateFilter(users);
          });
      }
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

  function countCommentsFromUser(user) {
    var articles = $("#livefyre_comment_stream article");
    var count = 0;
    articles.each(function () {
      var thisUser = $(this).find(".fyre-comment-user").attr("data-from");
      if (thisUser == user) {
        count++;
      }
    });
    return count;
  }

  function onValidateFilter(users) {
    // remove and add the table
    $('#validate-filter').remove();
    var table =
      "<table id='validate-filter'><thead></thead><tbody>" +
      "<tr><td>Filter Validation Table</td><td></td></tr>" +
      "</tbody</table>";
    $('#livefyre_comment_stream .fyre-stream-header').append(table);
    //users = ["HappyDaysAreHereAgain", "Muddytrails"]
    users.forEach(function (user) {
      var tr = "<tr><td>" + user + "</td><td>" +
        countCommentsFromUser(user) + "</td></tr>";
      $('#validate-filter tbody').append(tr);
    });
  }
}