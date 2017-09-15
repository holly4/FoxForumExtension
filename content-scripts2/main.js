var modules = []

$(document).ready(function () {
    function log(line) {
        console.log('main: ' + line);
    }

    chrome.storage.local.get(null, function (items) {
        let settings = {};
        if (!chrome.runtime.error) {
            settings = items;
            console.log(settings);
            // wait for class sppre_messages-list
            var checker = setInterval(function () {
                let list = $(".sppre_messages-list");
                if (list.length) {
                    clearInterval(checker);
                    onForumLoaded(settings);
                }
            }, 1000);
        }
    });

/*
    let logging = false;

    function showTable(state) {
        let $firstRow = $("#logging tr:first-child");
        let $otherRows = $("#logging tr:not(:first-child)")

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
                $(this).attr('src', state ? checkedBox : checkBox);
                if (state) {
                    $container.find('table').show();
                } else {
                    $container.find('table').hide();
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

        addHeader($container, title, logging, set_state);

        let $table = $('<table>')
            .appendTo($container)
            .attr('id', 'logging')
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

    function addRow(key, state, setState) {
        let $tr = $("<tr>")
            .appendTo($('#logging'));

        let $td = $('<td>')
            .appendTo($tr)
        $('<button>')
        $('<img>')
            .appendTo($td)
            .addClass('icon')
            .attr('src', state ? checkedBox : checkBox)
            .css('height', iconSize)
            .css('width', iconSize)
            .click(function () {
                state = !state;
                $(this).attr('src', state ? checkedBox : checkBox)
                setState(key, state);
            });
        $('<td>')
            .appendTo($tr)
            .text(key)
    }

    let loggingStates = {};

    function createTable() {
        let loggers = ["AvatarSwapper", "CleanComments", "CommentObserver", "FilterUsers()"]

        if (settings.loggingStates) {
            loggingStates = settings.loggingStates;
            console.log('logging: ', loggingStates);
        } else {
            logging = false;
            loggingStates = {};
            loggers.forEach((i) => loggingStates[i] = false);
            chrome.storage.local.set({
                loggingStates: loggingStates
            });
            console.log('wrote: ', loggingStates);
        }

        addTable("Logging", function (state) {
            chrome.storage.local.set({
                logging: state
            });
        });

        loggers.forEach(function (i) {
            addRow(i, loggingStates[i], function (key, state) {
                loggingStates[key] = state;
                chrome.storage.local.set({
                    loggingStates: loggingStates
                });
                console.log('wrote: ', loggingStates);
            });
        });

        showTable(false);
    }

    if (settings.logging) {
        logging = settings.logging;
        console.log('logging: ', logging);
    } else {
        logging = false;
        chrome.storage.local.set({
            logging: logging
        });
        console.log('wrote: ', logging);
    }
    */

    // once forum is loaded change the post type and
    // wait for awknowledgement 
    function onForumLoaded(settings) {
        log('Forum loaded');

        $("body").css('color', 'blue');
        $('<div id="ffh-div"></div>').insertAfter($('.sppre_conversation-header'));

        if ($('.sppre_sort-by').text() !== "Newest") {
            $('.sppre_sort-by').click();
            //<div data-spmark="newest"><span>Newest</span></div>
            setTimeout(function () {
                $('.sppre_sort-menu [data-spmark="newest"]').click();
                var readyChecker = setTimeout(function(){
                    if ($('.sppre_sort-by').text() === "Newest") {
                        clearTimeout(readyChecker);
                        onReady(settings);
                    }
                }, 500);
            }, 500);
        } else {
            // no need to change as already on newest
            onReady(settings)
        }
    }

    function onReady(settings) {
        modules = {
            avatarSwapper: new Module_AvatarSwapper(),
            commentCleaner: Module_CleanComments(),
            commentObserver: Module_CommentObserver(),
            filterUsers: new Module_FilterUsers(),
            //liker: new Module_LikeComments(),
        }

        settings.loggingEnabled = true;
        modules.commentObserver.perform(settings);
        modules.commentCleaner.perform(settings);
        modules.avatarSwapper.perform(settings);
        modules.filterUsers.perform(settings);
        //modules.liker.perform(settings);
        
        //window.parent.postMessage("ffhcomplete", "*");
    }
});