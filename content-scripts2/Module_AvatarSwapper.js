"use strict";

// the code to filter users comments
// (ಠ_ಠ)┌∩┐

/* exported Module_AvatarSwapper */
function Module_AvatarSwapper() {
    let loggingEnabled = false;
    let swapping = true;
    var observerId = undefined;
    let settings = {};
    let userNameToAvatar = undefined;

    let defuserNameToAvatar = [{
            enabled: true,
            name: "HappyDaysAreHereAgain",
            url: "https://image.ibb.co/eTUUTa/crazy.jpg"
        },
        {
            enabled: true,
            name: "KCH3",
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
        },
        {
            enabled: true,
            name: "Thinkinowtloud2",
            url: "https://image.ibb.co/n2JrWv/cryingemogi.png"
        },
        {
            enabled: true,
            name: "archersterling96",
            url: "https://image.ibb.co/bZbfg5/pileofpoo.jpg"
        }
    ];

    return {
        perform: perform,
    };

    function perform(parm) {
        if (_.keys(parm.userNameToAvatar) != _.keys(defuserNameToAvatar)) {
            parm.userNameToAvatar = null;
        }

        settings = parm;
        loggingEnabled = settings.get(loggingEnabled);

        console.log('AvatarSwapper',
            settings.get('swapping'),
            settings.get('userNameToAvatar'));

        //userNameToAvatar = settings.getOrSet('userNameToAvatar', defuserNameToAvatar);
        userNameToAvatar = defuserNameToAvatar;

        swapping = settings.getOrSet('swapping', false);

        addTable("Enable Avatar Swapping", function (state) {
            swapping = state;
            settings.set('swapping', swapping);
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
        let $rows = $("#avatarSwaps tr");
        if (state) {
            $($rows[0]).find('img').attr('src', closeIcon);
            _.each(_.rest($rows, 1), (i) => $(i).show());
        } else {
            $($rows[0]).find('img').attr('src', openIcon);
            _.each(_.rest($rows, 1), (i) => $(i).hide());
        }
    }

    function addHeader($container, text, state, set_state) {
        let $div = $('<div>')
            .css('margin-top', '.5em;')
            .appendTo($container);

        $('<img>')
            .appendTo($div)
            .attr('src', state ? checkedBox : checkBox)
            .css('height', iconSize)
            .css('width', iconSize)
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
            .css('margin-left', '.5em')
            .text(text);
    }

    function addTable(title, set_state) {
        let state = false;

        let $container = $('<div>')
            .appendTo($('#ffh-div'))
            .addClass('site')
            .css('margin-left', '1em');
            
        addHeader($container, title, swapping, set_state);

        let $table = $('<table>') //<col style="width:10%"><col style="width:30%"><col style="width:60%"</table>
            .appendTo($container)
            .attr('id', 'avatarSwaps')
            .css('font-size', 'smaller');

        $('<col style="width:5%">').appendTo($table);
        $('<col style="width:15%">').appendTo($table);           
        $('<col style="width:30%">').appendTo($table);           
        $('<col style="width:50%">').appendTo($table);

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
    }

    function addRow(row) {
        console.log(row.name);
        let state = row.enabled;
        let $tr = $("<tr>")
            .appendTo($('#avatarSwaps')
                .css('margin-left', '1em'));

        let $td = $('<td>')
            .appendTo($tr)
        $('<img>')
            .appendTo($td)
            .addClass('icon')
            .attr('src', state ? checkedBox : checkBox)
            .css('height', iconSize)
            .css('width', iconSize)
            .click(function () {
                state = !state;
                $(this).attr('src', state ? checkedBox : checkBox)
                let index = _.findIndex(userNameToAvatar, {
                    name: row.name
                });
                if (index >= 0) {
                    userNameToAvatar[index].enabled = state;
                }
                settings.set('userNameToAvatar', userNameToAvatar);
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
        let rec = _.findWhere(userNameToAvatar, {
            name: comment.userName
        });
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