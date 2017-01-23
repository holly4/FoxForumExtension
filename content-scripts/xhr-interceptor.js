"use strict";

// script injected into page context to intercept XHRs

(function () {
    var loggingEnabled = false;

    function log(line) {
        if (loggingEnabled) {
            console.log("interceptor: " + line);
        }
    }

    log("installing");

    function sendMessage(xhr) {
        log("sendMessage...");
        window.postMessage(xhr.responseText, window.location.href);
    }

    // Remember references to original methods
    var XHR = XMLHttpRequest.prototype;
    var open = XHR.open;
    var send = XHR.send;

    // Overwrite native methods
    // Collect data: 
    XHR.open = function(method, url) {
        this._method = method;
        this._url = url;
        return open.apply(this, arguments);
    };

    // Implement "ajaxSuccess" functionality
    XHR.send = function(postData) {
        this.addEventListener('load', function() {
            /* Method        */ this._method
            /* URL           */ this._url
            /* Response body */ this.responseText
            /* Request body  */ postData
            sendMessage(this);
        });
        return send.apply(this, arguments);
    };
}());