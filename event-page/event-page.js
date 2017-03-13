"use strict";

// event page - runs in the context of the extension

(function () {
  // simple logging functions
  function logAll(line) {
    console.log("event_page: " + line);
  }

  function log(line) {
    logging && logAll(line);
  }

  logAll("loaded");
  var logging = true; // log until settings read

  const _browser = window.browser ? window.browser : window.chrome;

  // load settings
  SETTINGS.load(function (data, isInstallOrUpgade) {
    logAll("loaded settings(" + isInstallOrUpgade + "): " + JSON.stringify(data));
    logging = data.logging;
    if (isInstallOrUpgade) {
      var url = "http://hollies.pw/static/ffh/" + data.version + "/welcome/";
      _browser.tabs.create({
        url: url
      }, function () {});
    }
  });

  // listen for the request to show the extension as active
  _browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    logAll("onMessage: " + JSON.stringify(request));

    switch (request.action) {

      case SHOW_MESSAGE.action:
        {
          _browser.tabs.query({
            active: true,
            currentWindow: true
          }, function (tabs) {
            if (tabs && tabs.length > 0) {
              _browser.pageAction.show(tabs[0].id);
            }
            else {
              console.log("ERROR: cannot get tabs on message: ", request.action);
            }

          });
          break;
        }

      case GET_SETTINGS_MESSAGE.action:
        {
          logAll("loading settings...");
          SETTINGS.load(function (settings) {
            logAll("setting loaded sending response: " + settings);
            sendResponse && sendResponse(settings);
          });
          return true; // indicate will send response asynchronously  
        }

      case SET_SETTINGS_MESSAGE.action:
        {
          // sanity check. don't save an empty object
          if (!request.settings || jQuery.isEmptyObject(request.settings)) {
            logAll("ERROR!!! attempt to save empty settings object!")
          } else {
            SETTINGS.save(request.settings, function (state) {
              sendResponse && sendResponse(state);
            });
          }
          break;
        }

      case SET_FILTEREES_MESSAGE.action:
        {
          // load settings
          SETTINGS.load(function (data) {
            logging = data.logging;
            log("loaded settings" + JSON.stringify(data));
            data.filterUsers = request.enabled;
            data.filteredUsers = request.filteredUsers
            var saveRequest = SET_SETTINGS_MESSAGE;
            saveRequest.settings = data;
            SETTINGS.save(saveRequest.settings, function (state) {
              sendResponse && sendResponse(state);
            });
          });

          break;
        }

      case RESTORE_SETTINGS_MESSAGE.action:
        {
          logAll("restore settings...");
          SETTINGS.restore(function (state) {
            logAll("restored sending response: " + state);
            sendResponse && sendResponse(state);
          });
          break;
        }

      default:
        logAll("unrecognized command: " + request.action);
        break;
    }

    return false; // no reply (or was handled synchronously)
  });

}());