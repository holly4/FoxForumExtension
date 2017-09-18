"use strict";

/* exported Module_Settings */
function Module_Settings(_settings) {
    var settings = _settings;

    return {
        get: get,
        getOrSet: getOrSet,
        set: set
    };

    function get(name) {
        return settings[name];
    }

    function getOrSet(name, defval) {
        if (!settings[name]) {
            settings[name] = defval;
            set(name, defval);
        }

        return settings[name];
    }

    function set(name, value) {
        var obj = {}
        obj[name] = value;

        if (isExtension) {
            var storage = chrome.storage.local;            
            storage.set(obj);
        }
    }


}
