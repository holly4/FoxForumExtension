"use strict";

// the code to filter users comments
// (ಠ_ಠ)┌∩┐

/* exported Module_FilterUsers */
function Module_FilterUsers() {

    let loggingEnabled = false;
    let observerId = undefined;
    let filteredUsers = [];
    let filtering = false;
    const iconSize = '1em';

    return {
        perform: perform,
    };


    function log(line) {
        if (loggingEnabled) {
            console.log("FilterUsers: " + line);
        }
    }

    function perform(settings) {
        loggingEnabled = settings.loggingEnabled;
        log('installed');

        if (settings.filteredUsers) {
            filteredUsers = settings.filteredUsers;
            console.log('filteredUsers: ', filteredUsers);
        }
        else
        {
            filteredUsers = [];

            chrome.storage.sync.set({userNameToAvatar: filteredUsers}, function() {
                //console.log('wrote: ', filteredUsers);    
            });               
        }

        if (settings.filtering) {
            filtering = settings.filtering;
            console.log('filtering: ', filtering);
        } else {
            filtering = false;
            chrome.storage.sync.set({filtering: filtering});     
            //console.log('wrote: ', filtering);    
        }

        addTable("Enable Filtering");
        _.each(filteredUsers, addUser);
        showTable(false);     

        // connect to observer
        observerId = modules.commentObserver.attach(this, processMutations);
        log("attached to observer: " + observerId);

        // handle existing comments
        let msgs = modules.commentObserver.scan();
        processComments(msgs);

        // listen for the filter users
        window.addEventListener("message", function (event) {
            //console.log("MESSAGE", event);
            if (event.data.msg === FILTER_USER_MESSAGE.msg) {
                addUser(event.data.userName);
                removePostsBy(event.data.userName);
            }
        });
    }    

    // return the id for a user
    function idFromUser(user) {
        return "user_" + user.replace(/ /g, '_') + "_count";
    }

    function showTable(state) {
        let $firstRow = $("#filteredByUser tr:first-child");
        let $otherRows = $("#filteredByUser tr:not(:first-child)")
        if (state) {
            $firstRow.find('img').attr('src', closeIcon);
            $otherRows.show();
        } else {
            $firstRow.find('img').attr('src', openIcon);
            $otherRows.hide();
        }
    }

    function addHeader($container, title) {
        let $div = $('<div>')
            .appendTo($container);

        $('<img>')
            .appendTo($div)
            .attr('src', filtering ? checkedBox : checkBox)
            .css('height', iconSize)
            .css('width', iconSize)
            .css('margin-right', '1em')
            .click(function () {
                filtering = !filtering;
                chrome.storage.sync.set({filtering: filtering});     
                //console.log('wrote: ', filtering);                  
                $(this).attr('src', filtering ? checkedBox : checkBox);
                if (filtering) {
                    $('#filteredByUser').show();
                } else {
                    $('#filteredByUser').hide();
                }
            });

        $('<span>')
            .appendTo($div)
            .text(title);
    }

    function addTable(title) {
        let state = false;

        let $container = $('<div>')
            .appendTo($('#ffh-div'))
            .addClass('site')
            .css('padding-bottom', '10px');

        addHeader($container, title);

        let $table = $('<table>')
            .appendTo($container)
            .attr('id', 'filteredByUser')
            .css('font-size', 'smaller');

        let $tr = $('<tr>');
        $tr.appendTo($table);
        $('<img>')
            .attr('src', closeIcon)
            .css('height', iconSize)
            .css('width', iconSize)
            .click(function () {
                state = !state;
                showTable(state);
            }).appendTo($tr);

        $tr.append($('<td style="width:50%">Total Filtered Posts</td>'));
        $tr.append($('<td id="totalFilteredPosts" style="width:50%">0</td>'));
    }

    function addRow(user, visible) {
        let $tr = $("<tr>")
            .appendTo($('#filteredByUser'));
        visible ? $tr.show() : $tr.hide;

        let $td = $('<td>')
            .appendTo($tr)
        $('<img>')
            .appendTo($td)
            .attr('src', deleteIcon)
            .css('height', iconSize)
            .css('width', iconSize)
            .css('margin-right', '1em')
            .click(function () {
                removeUser(user);
                updateTableCount();
            });
        $('<td>')
            .appendTo($tr)
            .text(user)
            .addClass('filter-user')
        $('<td>')
            .appendTo($tr)
            .attr('id', idFromUser(user))
            .addClass('filter-count')
            .text(0);
    }

    function addUser(user) {
        if (!_.contains(filteredUsers, user)) {
            filteredUsers.push(user);
            chrome.storage.sync.set({filteredUsers: filteredUsers});     
            //console.log('wrote: ', filteredUsers);              
        }
        addRow(user, false);
    }

    function removeUser(user) {
        filteredUsers = _.without(filteredUsers, user);
        chrome.storage.sync.set({filteredUsers: filteredUsers});     
        //console.log('wrote: ', filteredUsers); 
        $('#filteredByUser .filter-user').each(function (index, value) {
            let $value = $(value);
            if ($value.text() == user) {
                $value.closest('tr').remove();
            }
        });
    }

    // remove all present posts by user
    function removePostsBy(user) {
        let msgs = modules.commentObserver.scan();
        let byUser = msgs.filter((i) => i.userName === user);
        $.each(byUser, function (index, value) {
            processComment(value);
        });
    }

    // update the filter table count from the row counts
    function updateTableCount() {
        let total = 0;
        $("#filteredByUser .filter-count").each(function () {
            total += parseInt($(this).text());
        });

        $('#totalFilteredPosts').text(total);
    }

    // entry point to the module:
    //  state: true/false if module is enabled
    //  _users: string array of users to filter

    function processComment(comment) {
        if (_.contains(filteredUsers, comment.userName)) {
            //log(JSON.stringify(comment));
            let $element = $(comment.element);
            $('<div>')
                .css('height', '.5em')
                .css('background-color', 'powderblue')
                .css('margin', 'auto')
                .css('width', '70%')
                .css('border-radius', '25px')
                .insertAfter($element);
            $element.hide();
            //$(comment.element).css('background-color', 'yellow');

            let $cell = $('#' + idFromUser(comment.userName));
            let userTotal = parseInt($cell.text()) + 1;
            $cell.text(userTotal);
            $cell.closest('tr').show();
        }
    }

    function processComments(comments) {
        $.each(comments, function (index, comment) {
            if (comment.hasOwnProperty("userName")) {
                processComment(comment);
            }            
            processComment(comment);
        });
        updateTableCount();
    }

    function processMutations(comments) {
        processComments(comments);
    }
}