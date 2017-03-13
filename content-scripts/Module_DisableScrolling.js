"use strict";

// the module to enable and disable scrolling

/* exported Module_DisableScrolling */
function Module_DisableScrolling() {
  var loggingEnabled;

  function log(line) {
    if (loggingEnabled) {
      console.log("DisableScrolling: " + line);
    }
  }

  return {
    perform: perform,
  };

  // entry point to the module:
  //  state: true/false if module is enabled
  function perform(state, _loggingEnabled) {
    loggingEnabled = _loggingEnabled;
    log("perform " + state);

    log("installing");

    // add the tools div if not present
    addToolsDiv();

    $('<script>')
      .attr('type', 'text/javascript')
      .attr('src', chrome.extension.getURL('content-scripts/disable-scrolling.js'))
      .appendTo('head');
  }
}