var modules = []

$(document).ready(function () {
    function log(line) {
        console.log('main: ' + line);
    }

    chrome.storage.sync.get(null, function (items) {
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

    function onForumLoaded(settings) {
        log('Forum loaded');

        $("body").css('color', 'blue');

        $('<div id="ffh-div"></div>').insertAfter($('.sppre_conversation-header'));

        modules = {
            avatarSwapper: new Module_AvatarSwapper(),
            commentCleaner: Module_CleanComments(),
            commentObserver: Module_CommentObserver(),
            filterUsers: new Module_FilterUsers(),
        }

        settings.loggingEnabled = true;
        modules.commentObserver.perform(settings);
        modules.commentCleaner.perform(settings);
        modules.avatarSwapper.perform(settings);
        modules.filterUsers.perform(settings);
    }
});