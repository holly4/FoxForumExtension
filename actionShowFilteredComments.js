// the code to restore filterred comments

var observer = null;

// TODO: allow turning off the mutation observer

function actionShowFilteredComments() {
    if (!(observer === null)) {
        console.log('ShowFilteredComments observer already defined');
        return;
    }

    observer = new MutationObserver(function (mutations) {

        // process each mutation indivudually.
        // this may or may not be needed depending on how the mutations are grouped
        // i.e., it guarenteed that all mutations for deleting a comment are bunched into
        // one larger mutation?

        mutations.forEach(function (mutation) {
            
            // this would restore the liker images but must then restore the 
            // comment footer too. But filtered comments usually have no likes.
            // mutation.removedNodes.forEach(function(entry) {
            //    if ($(entry).hasClass('fyre-comment-like-imgs')) {
            //        $(mutation.target).append(entry);
            //    }
            //});

            // show the comment 
            if (mutation.type == "attributes") {
                if ($(mutation.target).hasClass('fyre-comment-wrapper')) {
                    $(mutation.target).show();
                }
            }

            // remove .fyre-comment-hidden
            if (mutation.type == "attributes") {
                if ($(mutation.target).hasClass('fyre-comment-hidden')) {
                    $(mutation.target).removeClass('fyre-comment-hidden');
                }
            }

            // restore various nodes
            mutation.removedNodes.forEach(function (entry) {
                if ($(entry).hasClass('fyre-comment-user')) {
                    $(mutation.target).append(entry);
                }
                if ($(entry).hasClass('fyre-comment-head')) {
                    $(mutation.target).append(entry);
                }
                if ($(entry).hasClass('fyre-comment-body')) {
                    var target = $(mutation.target);
                    target.append(entry);
                    target.find('section.fyre-comment-deleted').remove();
                    target.css('background-color', '#ffcccc');
                }
                // do not restore footer as cannot like a deleted comment
                //if ($(entry).hasClass('fyre-comment-footer')) {
                //    $(mutation.target).append(entry);
                //}                        
            });
        });
    });

    // don't need character data notifications
    var options = {
        attributes: true,
        childList: true,
        characterData: false,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: false
    };

    // start the observer on the comment stream
    var root = $('.fyre-comment-stream');
    observer.observe(root[0], options);
    console.log('started observer');
}