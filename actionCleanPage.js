// the code to hide non-comment area items from the page

function actionCleanPage() {
    
    if (!window.jQuery) {
        alert('jQuery is not loaded!!! Try refreshing the page.');
    } else {
        // hide non-comment material
        $('.masthead').remove();
        $('.alert').hide();
        $('#sub').hide();
        $('.article-info').hide();
        $('.social-count').hide();
        $('[data-widget-id]').hide();
        $('#rail').hide();
        $('.ad-container').hide();
        $('#powered_by_livefyre_new').hide();
        $('[itemprop|=articleBody]').hide();
        $('.ob_strip_container').hide();
        $('#network').hide();
        $('#top').hide();
        $('.video-ct').hide();
        $('.mod-14').hide();
        $('[itemprop|=headline]').hide();
        $('#bottom').hide();
        $('.fyre-stream-sort').hide();
        $('.freeform').hide();

        // enable the hidden comment count
        $('.fyre-stream-stats').attr('class', 'fyre-stream-stats1');
    }
}