"use strict";

var SETTINGS = (function () {
    var module = {};

    const _browser = window.browser ? window.browser : window.chrome;
    const SETTINGS_KEY = "settings";

    // module logging function
    function logAll(line) {
        console.log("settings.js: " + line);
    }
    var log = logAll;

    const defaultSettings = {
        cleanPage: true,
        cleanComments: true,
        cleanCommentshighlight: false,
        cleanCommentsColor: "#ccffff",
        disableScrolling: true,
        filterUsers: false,
        filteredUsers: [
            [true, "aBeautifuIMind"],
            [true, "BruceKardashian"],
            [true, "BillsCigar"],
            [true, "ClassyFredieBIasie2"],
            [true, "CoastaI2016"],
            [true, "ConservaPedia"],
            [true, "DrSigmundFreud"],
            [true, "FoodStampDemocrat"],
            [true, "HillbillyRodhamClinton"],
            [true, "InnocentLittleGirl"],
            [true, "LiberalMoron"],
            [true, "mittensGoesToJail"],
            [true, "MoronLiberal"],
            [true, "obamakeepswhinning"],
            [true, "pIaid"],
            [true, "PsychoBiIly"],
            [true, "SlickWilly2016"],
            [true, "USSRbot1984"],
            [true, "USSRbot2016"],
        ],
        logging: false,
        markMyFilteredComments: false,
        markMyFilteredCommentsColor: "#ffffaa", 
        removeVideo: true,
        showFilteredComments: true,
        showFilteredCommentsHighlight: true,
        showFilteredCommentsColor: "#ffcccc",        
        showLikerAvatars: true,
        version: _browser.runtime.getManifest().version,
    };

    function getStorage() {
        if (_browser && _browser.storage) {
            if (_browser.storage.sync) {
                logAll("getStorage -> storage.sync");
                return _browser.storage.sync;
            }
            if (_browser.storage.local) {
                logAll("getStorage -> storage.local");
                return _browser.storage.local;
            }
        }

        logAll("getStorage -> no storage");
        return null;
    }

    // updateSettings
    function upgradeSettings(settings, onUpgrade) {
        var isUpgrade = false;

        if (settings.version === undefined) {
            logAll("settings.version does not exist. setting to: " + defaultSettings.version);
            settings.version = defaultSettings.version;
            isUpgrade = true;
        } else {
            isUpgrade = settings.version !== defaultSettings.version;
            if (isUpgrade) {
                logAll("upgrade version from " + settings.version + " to " + defaultSettings.version);
                settings.version = defaultSettings.version;
            }
        }

        if (settings.cleanComments === undefined) {
            logAll("settings.cleanComments does not exist. setting to: " + defaultSettings.removeVideo);
            settings.cleanComments = defaultSettings.cleanComments;
            isUpgrade = true;
        }

        if (settings.removeVideo === undefined) {
            logAll("settings.removeVideo does not exist. setting to: " + defaultSettings.removeVideo);
            settings.removeVideo = defaultSettings.removeVideo;
            isUpgrade = true;
        }

        if (isUpgrade && onUpgrade) {
            onUpgrade(settings);
        }

        return settings;
    }

    // save settings
    module.save = function (settings, onSaved) {
        var storage = getStorage();
        if (storage) {
            logAll("save: " + JSON.stringify(settings));
            var items = {};
            items[SETTINGS_KEY] = settings;
            storage.set(items, function () {
                onSaved && onSaved(true);
            });
        } else {
            onSaved && onSaved(false);
        }
    }

    // restore default settings
    module.restore = function (onRestored) {
        var storage = getStorage();
        if (storage) {
            logAll("restore: " + JSON.stringify(defaultSettings));
            var items = {};
            items[SETTINGS_KEY] = defaultSettings;
            storage.set(items, function () {
                onRestored && onRestored(true);
            });
        } else {
            onRestored && onRestored(false);
        }
    }

    // load settings
    module.load = function (onLoaded) {
        var storage = getStorage();
        if (storage) {
            storage.get(SETTINGS_KEY, function (items) {
                if (items && items[SETTINGS_KEY]) {
                    var settings = items[SETTINGS_KEY];
                    logAll("load: " + JSON.stringify(settings));
                    var upgraded = false;
                    upgradeSettings(settings, function () {
                        log("settings upgraded");
                        upgraded = true;
                        module.save(settings);
                    });
                    if (onLoaded) {
                        logAll("calling onLoaded: " + settings);
                        onLoaded(settings, upgraded);
                    }
                } else {
                    logAll("load: failed to retrieve settings");
                    module.save(defaultSettings);
                    if (onLoaded) {
                        logAll("calling onLoaded: " + defaultSettings);
                        onLoaded(defaultSettings, true);
                    }
                }
            });
        } else {
            onLoaded(defaultSettings);
        }
    }

    return module;
}());