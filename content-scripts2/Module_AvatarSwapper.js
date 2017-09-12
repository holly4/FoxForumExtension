"use strict";

// the code to filter users comments
// (ಠ_ಠ)┌∩┐

/* exported Module_AvatarSwapper */
function Module_AvatarSwapper() {
    let loggingEnabled = false;
    let swapping = true;
    var observerId = undefined;
    let userNameToAvatar = {};

    return {
        perform: perform,
    };

    function perform(settings) {
        log('installed');
        loggingEnabled = settings.loggingEnabled;

        if (settings.userNameToAvatar) {
            userNameToAvatar = settings.userNameToAvatar;
            console.log('userNameToAvatar: ', userNameToAvatar);
        }
        else
        {
            userNameToAvatar = [
                {   
                    enabled: true,
                    name: "HappyDaysAreHereAgain",
                    url: "https://image.ibb.co/eTUUTa/crazy.jpg"
                },
                {   
                    enabled: true,
                    name: "KCH1",
                    url: "https://image.ibb.co/kFsuuF/cutebunny.jpg"
                },
                {   
                    enabled: true,
                    name: "DowntownDavis",
                    url: "https://image.ibb.co/h9z7EF/omniphobic.jpg"
                },
                {   
                    enabled: true,
                    name: "The_Fifth_Dentist",
                    url: "https://image.ibb.co/k6gyMv/kraft.jpg"
                },
                {   
                    enabled: true,
                    name: "CanadianCivilian",
                    url: "https://image.ibb.co/hHYTMv/scottthedick.jpg"
                }
                //"thinkinowtlowd": "https://image.ibb.co/hJLm8a/snowflake.jpg",                
            ];
            chrome.storage.sync.set({userNameToAvatar: userNameToAvatar});
            //console.log('wrote: ', userNameToAvatar);
            chrome.storage.sync.set({userNameToAvatar: userNameToAvatar}, function() {
                //console.log('wrote: ', userNameToAvatar);    
            });               
        }

        if (settings.swapping) {
            swapping = settings.swapping;
            console.log('swapping: ', swapping);
        } else {
            swapping = false;
            chrome.storage.sync.set({swapping: swapping});     
            //console.log('wrote: ', swapping);    
        }

        addTable("Enable Avatar Swapping", function (state) {
            swapping = state;
            chrome.storage.sync.set({swapping: swapping}, function() {
                //console.log('wrote: ', swapping);    
            });    
        });

        _.each(userNameToAvatar, (i) => addRow(i));

        showTable(false);            

        // connect to observer
        observerId = modules.commentObserver.attach(this, processMutations);
        log("attached to observer: " + observerId);

        // handle existing comments
        var comments = modules.commentObserver.scan();
        $.each(comments, function (index, value) {
            processComment(value);
        });
    }

    function log(line) {
        if (loggingEnabled) {
            console.log("AvatarSwapper: " + line);
        }
    }

    function showTable(state) {
        let $firstRow = $("#avatarSwaps tr:first-child");
        let $otherRows = $("#avatarSwaps tr:not(:first-child)")
        if (state) {
            $firstRow.find('img').attr('src', closeIcon);
            $otherRows.show();
        } else {
            $firstRow.find('img').attr('src', openIcon);
            $otherRows.hide();
        }
    }

    function addHeader($container, text, state, set_state) {
        let $div = $('<div>')
            .appendTo($container);

        $('<img>')
            .appendTo($div)
            .attr('src', state ? checkedBox : checkBox)
            .css('height', iconSize)
            .css('width', iconSize)
            .css('margin-right', '1em')
            .click(function () {
                state = !state;
                set_state(state);
                $(this).attr('src', swapping ? checkedBox : checkBox);
                if (state) {
                    $(this).closest('.site').find('table').show();
                } else {
                    $(this).closest('.site').find('table').hide();
                }
            });

        $('<span>')
            .appendTo($div)
            .text(text);
    }

    function addTable(title, set_state) {
        let state = false;

        let $container = $('<div>')
            .appendTo($('#ffh-div'))
            .addClass('site')
            .css('padding-bottom', '10px');

        addHeader($container, title, swapping, set_state);

        let $table = $('<table>')
            .appendTo($container)
            .attr('id', 'avatarSwaps')
            .css('font-size', 'smaller');

        let $tr = $('<tr>')
            .appendTo($table);

        $('<img>')
            .attr('src', state ? closeIcon : openIcon)
            .css('height', iconSize)
            .css('width', iconSize)
            .css('margin-right', '1em')
            .click(function () {
                state = !state;
                showTable(state);
            }).appendTo($tr);

        $tr = $('<tr>')
            .appendTo($table);
    }

    function addRow(row) {
        let state = row.enabled;
        let $tr = $("<tr>")
            .appendTo($('#avatarSwaps'));

        let $td = $('<td>')
            .appendTo($tr)
        $('<button>')
        $('<img>')
            .appendTo($td)
            .addClass('icon')
            .attr('src', state ?  checkedBox : checkBox)
            .css('height', iconSize)
            .css('width', iconSize)
            .click(function () {
                state = !state;
                $(this).attr('src', state ?  checkedBox : checkBox)
                let index = _.findIndex(userNameToAvatar, {name: row.name});
                if (index >= 0) {
                    userNameToAvatar[index].enabled = state;
                }
                chrome.storage.sync.set({userNameToAvatar: userNameToAvatar}, function() {
                    //console.log('wrote: ', userNameToAvatar);    
                });                     
            });
        $('<td>')
            .appendTo($tr).append(
                $('<img>')
                .attr('src', row.url)
                .css('height', '40px')
                .css('width', '40px'));
        $('<td>')
            .appendTo($tr)
            .text(row.name)
            .addClass('avatar-user')
        $('<td>')
            .appendTo($tr)
            .addClass('avatar-url')
            .text(row.url);
    }

    function processComment(comment) {
        let rec = _.findWhere(userNameToAvatar, {name: comment.userName});
        if (rec) {
            log("change avatar " + comment.userName + " " + rec.url);
            var $image = $(comment.element).find('.sppre_user-image');
            var before = $image.css("background-image");
            $image.css("background-image", "");
            var size = before.search("h_34,w_34") >= 0 ?
                34 : 44;
            var img = $("<img>")
                .attr("src", rec.url)
                .attr("height", size)
                .attr("width", size);
            $image.append(img);
        }
    }

    function processMutations(mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.hasOwnProperty("userName")) {
                processComment(mutation);
            }
        });
    }
}