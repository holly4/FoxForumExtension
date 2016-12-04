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

  // entry point to the module:
  //  state: true/false if module is enabled
  function perform(state, _loggingEnabled) {
    loggingEnabled = _loggingEnabled;
    log("perform " + state);

    // this cannot be undone so is done anytime is requested
    // it is not an expensive operation

    if (state) {
      // remove non-comment material
      $('.masthead').remove();
      $('.alert').remove();
      $('#sub').remove();
      $('.article-info').remove();
      $('.social-count').remove();
      $('[data-widget-id]').remove();
      $('#rail').remove();
      $('.ad-container').remove();
      $('#powered_by_livefyre_new').remove();
      $('[itemprop|=articleBody]').remove();
      $('.ob_strip_container').remove();
      $('#network').remove();
      $('#top').remove();
      $('.video-ct').remove();
      $('.mod-14').remove();
      $('[itemprop|=headline]').remove();
      $('#bottom').remove();
      $('.fyre-stream-sort').remove();
      $('.freeform').remove();

      // enable the hidden comment count
      $('.fyre-stream-stats').css('display', 'inline');

      // remove extra padding at the top
      $('#commenting').css('padding', '0px');

      // fix issue where the main editor and the user avatar overlap making
      // it imposible to select with the mouse the first dozen or so letters in a comment
      $('.fyre-editor').first().css('padding-top', 16);
    }
  }
}