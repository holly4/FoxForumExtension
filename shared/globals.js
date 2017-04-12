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

/* exported STATE_WAITING_FOR_ARTICLE */
const STATE_WAITING_FOR_ARTICLE = "waiting for article";

/* exported STATE_WAITING_FOR_COMMENT_STREAM */
const STATE_WAITING_FOR_COMMENT_STREAM = "waiting for comment stream";

/* exported getUserName */
// TODO: make globals a module
function getUserName() {
    var stream = $("#livefyre_comment_stream");
    var userName = stream.find(".fyre-user-loggedin").text().trim();
    return userName;
}

/* exported addToolsDiv */
// add common div for tools if not present
function addToolsDiv() {
    if (!$("#ffh-tools").length) {
        $("<div id='ffh-tools' style='float:left;vertical-align:middle;margin-top:-5px' ></div>")
            .insertBefore("#livefyre_comment_stream .fyre-stream-header");
    }
}