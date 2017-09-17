"use strict";

// shared DOM Observer

/* exported Module_CommentObserver */
function Module_CommentObserver() {

    var loggingEnabled = false;
    var observers = [];
    var theObserver = undefined;
    var activeObservers = 0;

    var observerOptions = {
        attributes: true,
        childList: true,
        subtree: true,
        attributeOldValue: true,
        // todo handle character data on editted comment
        characterDataOldValue: false,
        characterData: false,
    };

    return {
        perform: perform,
        attach: attachObserver,
        detach: detachObserver,
        scan: scan
    };

    function log(line) {
        if (loggingEnabled) {
            console.log("CommentObserver: " + line);
        }
    }

    // entry point to the module:
    function perform(_loggingEnabled) {
        loggingEnabled = _loggingEnabled;
        log("perform");
    }

    // start the MutationObserver
    function startObserver() {
        if (theObserver === undefined) {
            theObserver = new MutationObserver(onMutations);
        }
        var target = '.sppre_messages-list';
        var elementToObserve = $(target);
        if (elementToObserve.length === 0) {
            alert('startObserver: cannot find ' + target + 'If the page is loading wait and try again.');
        } else {
            theObserver.observe(elementToObserve[0], observerOptions);
        }
    }

    // stop the MutationObserver
    function stopObserver() {
        theObserver.disconnect();
    }

    function parseComment($node) {
        // get user name
        // <div class="sppre_user-link"><span class="sppre_username" data-spot-im-class="message-username">CommonWinterberry</span>
        var userName = $node.find('.sppre_username').first().text();
        var text = $node.find('.sppre_text-entity').first().text();
        return {
            element: $node[0],
            userName: userName.replace(/ /g, ''),
            text: text
        }
    }

    // scan existing comments
    function scan() {
        var comments = [];
        var $msgs = $.find('.sppre_appearance-component');
        $.each($msgs, function (index, value) {
            comments.push(parseComment($(value)));
        });
        return comments;
    }

    function onMutations(mutations) {
        let res = [];

        mutations.forEach(function (mutation) {

            mutation.addedNodes.forEach(function (node) {
                let $node = $(node);
                let $msg = $node.find('.sppre_appearance-component');
                if ($msg.length) {
                    let comment = parseComment($msg);
                    res.push(comment);
                } else {
                    res.push({
                        node: node
                    });
                    if ($node.hasClass('sppre_open')) {
                        let userName = $node.parent().parent().find('.sppre_username[data-spot-im-class="message-username"]').text();
                        let $li = $('<li class="sppre_item"><span></span></li>')
                            .appendTo(".sppre_droplist");
                        $('<span>Filter</span>')
                            .appendTo($li)
                            .click(function () {
                                var msg = FILTER_USER_MESSAGE;
                                msg.userName = userName.replace(/ /g, '');
                                window.postMessage(msg, window.location.href);
                            });
                    }
                }
            });
        });


        //stopObserver(); // ideally would stop observing
        // while modifying the DOM but is not working right
        observers.forEach(function (item) {
            if (item.callback !== null) {
                item.callback.call(item.that, res);
            }
        });
        //startObserver();
    }

    // attach a new observer and return id
    // start the MutationObserver if this is the first client
    function attachObserver(that, callback) {
        var item = {
            id: observers.length + 1,
            that: that,
            callback: callback,
        }

        log("attachObserver: added observer: " + item.id);

        observers.push(item);

        activeObservers++;

        if (theObserver === undefined) {
            log("attachObserver: start observer");
            startObserver();
        }

        return item.id;
    }

    // detach the observer with the specified id
    // stop the MutationObserver if no more attached clients
    function detachObserver(id) {
        for (let i = 0; i < observers.length; i++) {
            if (observers[i].id == id) {
                observers[i].callback = null;
                activeObservers--;
                log("detachObserver: removed observer: " + id);
                break;
            }
        }

        if (activeObservers == 0) {
            log("detachObserver: no more observers");
            stopObserver();
            theObserver = undefined;
        }
    }
}