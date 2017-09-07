"use strict";

/* exported GET_SETTINGS_MESSAGE */
const GET_SETTINGS_MESSAGE = {
    action: "get-settings",
    upgrade: false
}

/* exported SET_SETTINGS_MESSAGE */
const SET_SETTINGS_MESSAGE = {
    action: "set-settings",
    settings: {}
}

/* exported SET_FILTEREES_MESSAGE */
const SET_FILTEREES_MESSAGE = {
    action: "set-fiterees",
    enabled: false,
    filteredUsers: []
}

/* exported RESTORE_SETTINGS_MESSAGE */
const RESTORE_SETTINGS_MESSAGE = {
    action: "restore-settings",
}

/* exported SHOW_MESSAGE */
const SHOW_MESSAGE = {
    action: "show"
}

/* exported APPLY_SETTINGS_MESSAGE */
const APPLY_SETTINGS_MESSAGE = {
    action: "apply-settings",
    settings: {}
}

/* exported SHOW_OPTIONS_MESSAGE */
const SHOW_OPTIONS_MESSAGE = {
    action: "show-options"
}

/* exported getUserName */
// TODO: make globals a module
function getUserName() {
    //  TODO: 
    //  1. use a mutation watcher on the user name element to catch log-out/login
    //  2. change font-family upon changes as login switches it back to Helvetica
    var stream = $("#livefyre_comment_stream");
    var userNameElement = stream.find(".fyre-user-loggedin span");
    if (userNameElement.length)
        userNameElement.css("font-family", "tahoma");
    return userNameElement.text().trim();
}

/* exported addToolsDiv */
// add common div for tools if not present
function addToolsDiv() {
    if (!$("#ffh-tools").length) {
        let target = $("#livefyre_comment_stream .fyre-stream-header");
        if (!target.size()) {
            console.log("addToolsDiv: Cannot find target!");
        } else {
            $("<div id='ffh-tools' style='float:left;vertical-align:middle;margin-top:-5px' ></div>")
                .insertBefore(target);
        }
    }
}