"use strict";

// the code to filter users comments
// (ಠ_ಠ)┌∩┐

/* exported Module_FilterUsers */
function Module_FilterUsers() {

    let loggingEnabled = false;
    let observerId = undefined;
    let filteredUsers = [];
    let filtering = false;
    let settings = {};

    return {
        perform: perform,
    };

    function log(line) {
        if (loggingEnabled) {
            console.log("FilterUsers: " + line);
        }
    }

    function perform(parm) {
        settings = parm;
        loggingEnabled = settings.get('loggingEnabled');

        console.log('FilterUsers',
            settings.get('filtering'),
            settings.get('filteredUsers'));

        filteredUsers = settings.getOrSet( 'filteredUsers', ['Whereareanygoodones']);
        filtering = settings.getOrSet('filtering', false);
        
        addTable("Enable Filtering");
        _.each(filteredUsers, addUser);
        showTable(false);

        // connect to observer
        observerId = modules.commentObserver.attach(this, processMutations);
        log("attached to observer: " + observerId);

        // handle existing comments
        let msgs = modules.commentObserver.scan();
        processMutations(msgs);

        // listen for the filter users
        window.addEventListener("message", function (event) {
            //console.log("MESSAGE", event);
            if (event.data && event.data.msg === FILTER_USER_MESSAGE.msg) {
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
            .css('margin-top', '.5em;')
            .appendTo($container)

        $('<img>')
            .appendTo($div)
            .attr('src', filtering ? checkedBox : checkBox)
            .css('height', iconSize)
            .css('width', iconSize)
            .click(function () {
                filtering = !filtering;
                settings.set('filtering', filtering)
                $(this).attr('src', filtering ? checkedBox : checkBox);
                if (filtering) {
                    $('#filteredByUser').show();
                } else {
                    $('#filteredByUser').hide();
                }
            });

        $('<span>')
            .appendTo($div)
            .css('margin-left', '.5em')
            .text(title);
    }

    function addTable(title) {
        let state = false;

        let $container = $('<div>')
            .appendTo($('#ffh-div'))
            .addClass('site')
            .css('margin-left', '1em')

        addHeader($container, title);

        let $table = $('<table>')
            .appendTo($container)
            .attr('id', 'filteredByUser')
            .css('font-size', 'smaller')
            .css('margin-left', '1em');

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
            .appendTo($('#filteredByUser'))
            .css('margin-left', '1em');
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
            settings.set('filteredUsers', filteredUsers);
        }
        addRow(user, false);
    }

    function removeUser(user) {
        filteredUsers = _.without(filteredUsers, user);
        settings.set('filteredUsers', filteredUsers);
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
        //log('processComment: ' + comment.userName);
        if (_.contains(filteredUsers, comment.userName)) {
            let $element = $(comment.element);
            $('<div>')
                .css('height', '.125em')
                .css('background-color', 'lightgray')
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

    function processMutations(mutations) {
        if (filtering) {
            let comments = mutations.filter((i) => _.has(i, 'userName'));
            $.each(comments, (i, v) => processComment(v));
            updateTableCount();
        }
    }
}