// the module to enable and disable scrolling

(function () {
    var loggingEnabled = false;
    var scrollingEnabled = true;

    // handlers to store original methods
    var scrollToProper = window.scrollTo;
    var scrollByProper = window.scrollBy;

    function log(line) {
        if (loggingEnabled) {
            console.log("disable-scrolling: " + line);
        }
    }

    function onScrollingButtonClicked() {
        scrollingEnabled = !scrollingEnabled;
        log("scrollingEnabled: " + scrollingEnabled);
        if (scrollingEnabled) {
            $(this).text('Disable Scrolling');
        } else {
            $(this).text('Enable Scrolling');
        }
    }

    log("installing");

    // override the scollTo and scrollBy functions
    window.scrollTo = function (x, y) {
        log("scrollTo: " + x + "," + y);
        if (scrollingEnabled) {
            log("scrollToProper");
            scrollToProper(x, y);
        } else {
            log("scrollTo averted");
        }
    }

    window.scrollBy = function (x, y) {
        log("scrollBy: " + x + "," + y);
        if (scrollingEnabled) {
            log("scrollByProper");
            scrollByProper(x, y);
        } else {
            log("scrollBy averted");
        }
    }

    // create a new button to control scrolling
    if (!$("#ffh-scrolling").length) {
        $("<button id='ffh-scrolling' style='margin-right: 20px;'>Disable Scrolling</button>")
            .appendTo("#ffh-tools")
            .click(onScrollingButtonClicked);
    }
}());