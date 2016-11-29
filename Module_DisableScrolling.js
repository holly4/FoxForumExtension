// the module to enable and disable scrolling

function Module_DisableScrolling() {

  function log(line) {
    console.log("DisableScrolling: " + line);
  }

  function isEnabled() {
    return $('#enableScoll').length > 0;
  }

  // handlers to store original methods
  var scrollToProper = window.scrollTo;
  var scrollByProper = window.scrollBy;

  // is scrolling enabled?
  var scrollEnabled = true;

  return {
    perform
  };

  function perform(state) {

    log("perform " + state);

    if (state === isEnabled()) {
      // same state as before. nothing to do
      return;
    }

    if (!state)
    {
      log("removing");
      //  restore the scollTo and scrollBy functions
      window.scrollTo = scrollToProper;
      window.scrollByProper = scrollByProper;

      // remove the button
      $('#enableScoll').remove();
    }
    else
    {
      log("installing");

      // override the scollTo and scrollBy functions
      window.scrollTo = function(x, y) {
        if (scrollEnabled)
          scrollToProper(x, y);
      }
      window.scrollByProper = function(x, y) {
        if (scrollEnabled)
          scrollByProper(x, y);
      }

      // create a new button to control scrolling
      $('.fyre-editor').append('<a id="enableScoll">Scrolling Enabled</a>');
      var elem = $('#enableScoll');
      elem.css('background', '#00FFFF');
      elem.css('cursor', 'pointer');
      elem.css('border', 'solid 2px #eaeaea');
      elem.css('padding', '2');

      // set handler for the button click
      elem.click(function() {
        scrollEnabled = !scrollEnabled;
        if (scrollEnabled) {
          $(this).css('background', '#00FFFF');
          $(this).text('Scrolling Enabled');
        } else {
          $(this).css('background', '#F0FFFF');
          $(this).text('Scrolling Disabled');
        }
      });
    }
  }
}