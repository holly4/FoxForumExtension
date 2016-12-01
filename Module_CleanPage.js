function Module_CleanPage() {

function log(line) {
    console.log("CleanPage: " + line);
  }

  return {
    perform
  };

  // entry point to the module:
  //  state: true/false if module is enabled
  function perform(state) {
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
      // TODO: change to display: inline
      $('.fyre-stream-stats').attr('class', 'fyre-stream-stats1');
    }
  }
}