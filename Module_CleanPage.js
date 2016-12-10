function Module_CleanPage() {

  var loggingEnabled = false;

  return {
    perform
  };

  function log(line) {
    if (loggingEnabled) {
      console.log("CleanPage: " + line);
    }
  }

  // is the module installed on the page
  function isInstalled() {
    var len = $('#btnToggleArticle').length;
    var result = len > 0;
    log("isInstalled: " + result + "(" + len + ")");
    return result;
  }

  function install() {
    $('#wrapper').siblings().remove();
    $('#doc').siblings().remove();
    $('#content .main').siblings().remove();
    $('#commenting').siblings().each(function (i, val) {
      if (val.nodeName.toLowerCase() != 'article') {
        $(val).remove();
      }
    });
    // enable the hidden comment count
    $('.fyre-stream-stats').css('display', 'inline');
    // remove extra padding at the top
    $('#commenting').css('padding', '0px');

    // fix issue where the main editor and the user avatar overlap making
    // it imposible to select with the mouse the first dozen or so letters in a comment
    $('.fyre-editor').first().css('padding-top', 16);
    $('article').first().hide();
    $('#content .main').first().prepend("<button id='btnToggleArticle'>Show Article</button><br>");
    //$('#btnToggleArticle').css('margin-top', '20px');
    //$('#btnToggleArticle').css('margin-left', '20px');
    $('#btnToggleArticle').click(function () {
      if ($(this).text() == 'Show Article') {
        $('article').first().show();
        $(this).text('Hide Article');
      } else {
        $('article').first().hide();
        $(this).text('Show Article');
      }
    });
  }

  // entry point to the module:
  //  state: true/false if module is enabled
  function perform(state, _loggingEnabled) {
    loggingEnabled = _loggingEnabled;
    log("perform " + state);

    if (!state) {
      // this cannot be undone
    } else {
      if (!isInstalled()) {
        log("installing");
        var chkReadyState = setInterval(function() {
            if (document.readyState == "complete") {
                clearInterval(chkReadyState);
                install();
            } else {
              // TODO: capture log function?
              console.log("CleanPage: " + "waiting for load complete");
            }
        }, 100);
      } else {
        log("already installed");
      }
    }
  }
}