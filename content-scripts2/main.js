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
                log("waiting for forum load");
                let list = $(".sppre_messages-list");
                if (list.length) {
                    clearInterval(checker);
                    onForumLoaded(settings);
                }
            }, 1000);
        }
    });

    // once forum is loaded change the post type and
    // wait for awknowledgement 
    function onForumLoaded(settings) {
        log('Forum loaded');
        var manifest = chrome.runtime.getManifest();
        let state = true;
        $("body").css('color', 'blue');
        let $main = $('<div id="ffh-div" style="border-style: solid;border-width:thin;padding:.5em;"></div>')
            .insertAfter($('.sppre_conversation-header'));
        let $div = $('<div>')
            .appendTo($main);
        $('<img>')
            .appendTo($div)
            .attr('src', state ? closeIcon : openIcon)
            .css('height', iconSize)
            .css('width', iconSize)
            .css('margin-right', '1em')
            .click(function () {
                state = !state;
                $(this).attr('src', state ? closeIcon : openIcon);
                if (state) {
                    $main.children().not($div).show();
                } else {
                    $main.children().not($div).hide();
                }
            });
        ($('<span>')
            .appendTo($div)
            .text(manifest.name + " " + manifest.version));

        /*$('<a>').attr('href', 'http://foxforums.info')
            .css('margin-left', '1em')
            .appendTo($main)
            .attr('target', '_blank')
            .text('FoxForums.info');*/

        let $sortMenu = $('.sppre_sort-menu');
        let checkState = 0;
        let wait_until = 0;
        let target = "Newest";
        let attempts = 0;
        let master = setInterval(function () {
            if (attempts++ >= 40) {
                clearInterval(master);
                onReady(settings)
            }

            if (attempts >= wait_until) {
                switch (checkState) {
                    case 0:
                        // check for newest
                        if ($sortMenu.find('.sppre_sort-by').text() == target) {
                            clearInterval(master);
                            onReady(settings)
                        } else {
                            checkState = 1;
                        }
                        break;

                    case 1:
                        // open menu
                        $sortMenu.find('.sppre_sort-by').click();
                        checkState = 2;
                        break;

                    case 2:
                        // check for menu open
                        if ($sortMenu.find('.sppre_droplist').length) {
                            checkState = 3;
                        }
                        break;

                    case 3:
                        // click button
                        var button = $sortMenu.find('[data-spmark="newest"]');
                        if (button.length) {
                            button.click();
                            wait_until = attempts + 3;
                            checkState = 0;
                        }
                        break;
                }
            }
        }, 250);
    }

    function onReady(settings) {
        log("onReady");

        modules = {
            activityGraph: Module_ActivityGraph(),
            avatarSwapper: new Module_AvatarSwapper(),
            commentCleaner: Module_CleanComments(),
            commentObserver: Module_CommentObserver(),
            filterUsers: new Module_FilterUsers(),
            //liker: new Module_LikeComments(),
        }

        settings.loggingEnabled = true;
        var parm = Module_Settings(settings);
        modules.commentObserver.perform(parm);
        modules.commentCleaner.perform(parm);
        modules.activityGraph.perform(parm);
        modules.avatarSwapper.perform(parm);
        modules.filterUsers.perform(parm);
        //modules.liker.perform(settings);
        //window.parent.postMessage("ffhcomplete", "*");
    }
});