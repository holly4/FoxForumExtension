// module to clean comments
"use strict";

/* exported Module_Editor */
function Module_Editor() {

  var loggingEnabled = false;
  var observerId = undefined;
  let settings = undefined;

  return {
    perform: perform
  }

  function log(line) {
    if (loggingEnabled) {
      console.log("Editor: " + line);
    }
  }

  // entry point to the module:
  //  enabled: true/false if module is enabled
  function perform(parm) {
    settings = parm;
    loggingEnabled = settings.get(loggingEnabled);

    appendFunctions($('.sppre_buttons'));

    // connect to observer
    observerId = modules.commentObserver.attach(this, processMutations);
    log("attached to observer: " + observerId);
  }

  function appendFunctions($element) {
    $('<button class="sppre_bold-button brand-bg-color" style="width:2em;"><span>X</span></button>')
      .click(function () {
        document.execCommand('removeFormat', false, true);
      })
      .prependTo($element);
    $('<button class="sppre_bold-button brand-bg-color" style="width:2em;"><span>U</span></button>')
      .click(function () {
        document.execCommand('underline', false, true);
      })
      .prependTo($element);
    $('<button class="sppre_bold-button brand-bg-color" style="width:2em;"><span>I</span></button>')
      .click(function () {
        document.execCommand('italic', false, true);
      })
      .prependTo($element);
    $('<button class="sppre_bold-button brand-bg-color" style="width:2em;"><span>B</span></button>')
      .click(function () {
        document.execCommand('bold', false, true);
      })
      .prependTo($element);
  }

  function processMutations(mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.node) {
          appendFunctions($(mutation.node).find('.sppre_actions'));
      }
    });
  }
}