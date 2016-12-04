// shared DOM Observer

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

        var elementToObserve = $('.fyre-comment-stream');
        if (elementToObserve.length === 0) {
            alert('startObserver: cannot find .fyre-comment-stream. If the page is loading wait and try again.');
        } else {
            theObserver.observe(elementToObserve[0], observerOptions);
        }
    }

    // stop the MutationObserver
    function stopObserver() {
        theObserver.disconnect();
    }

    function onMutations(mutations) {
        //stopObserver(); // ideally would stop observing
        // while modifying the DOM but is not working right
        observers.forEach(function (item) {
            if (item.callback !== null) {
                item.callback(mutations);
            }
        });
        //startObserver();
    }

    // attach a new observer and return id
    // start the MutationObserver if this is the first client
    function attachObserver(priority, callback) {
        var item = {
            id: observers.length + 1,
            callback: callback
        }

        log("attachObserver: added observer: " + item.id);

        if (priority)
            observers.unshift(item);
        else
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
        for (var i = 0; i < observers.length; i++) {
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