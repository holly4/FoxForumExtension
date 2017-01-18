"use strict";

// the module to enable and disable scrolling

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

  // add common div for tools if not present
  function addToolsDiv() {
    if (!$("#ffh-tools").length) {
      $("<div id='ffh-tools' style='float:left;vertical-align:middle;margin-top:-5px' ></div>").insertBefore(".fyre-stream-header");
    }
  }

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