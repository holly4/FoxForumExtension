// the code to remove non-comment area items from the page

function actionCleanPage() {
    
    if (!window.jQuery) {
        alert('jQuery is not loaded!!! Try refreshing the page.');
    } else {
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
        $('.fyre-stream-stats').attr('class', 'fyre-stream-stats1');
    }
}