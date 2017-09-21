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
    loggingEnabled = settings.get('loggingEnabled');

    appendFunctions($('.sppre_buttons'));

    // connect to observer
    observerId = modules.commentObserver.attach(this, processMutations);
    log("attached to observer: " + observerId);
  }

  function appendFunctions($element) {
    let buttons = [
      ['X', 'removeFormat'],
      ['U', 'underline'],
      ['I', 'italic'],
      ['B', 'bold']
    ];
      _.each(buttons, function(i) {
        $('<button>')
        .text(i[0])
        .click(function() {
          document.execCommand(i[1], false, true);
          console.log(i);
        })
        .css('width', '2em')
        .css('border-radius', '4px')
        .prependTo($element);
      });
  }

  function processMutations(mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.node) {
          appendFunctions($(mutation.node).find('.sppre_actions'));
      }
    });
  }
}