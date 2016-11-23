// the code to add a button to enable and disable scrolling

// handlers to store original methods
var scrollToProper = window.scrollTo;
var scrollByProper = window.scrollBy;

  // is scrolling enabled?
var scrollEnabled = true;

function actionDisableScrolling() {

  // override the scollTo and scrollBy functions
  window.scrollTo = function (x, y) {
    if (scrollEnabled)
      scrollToProper(x, y);
  }
  window.scrollByProper = function (x, y) {
    if (scrollEnabled)
      scrollByProper(x, y);
  }

  // create a new button to control scrolling
  $('.fyre-editor').append('<a id="enableScoll" title="enableScoll">Scrolling Enabled</a>');
  var elem = $('#enableScoll');
  elem.css('background', '#00FFFF');
  elem.css('cursor', 'pointer');
  elem.css('border', 'solid 2px #eaeaea');
  elem.css('padding', '2');

  // set handler for the button click
  elem.click(function () {
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