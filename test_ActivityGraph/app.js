"use strict";

var modules = []

/* exported isExtension */
function isExtension() {
    return window.chrome && chrome.runtime && chrome.runtime.id;
}

/* exported deleteIcon */
const deleteIcon = '../content-scripts2/icons/cancel-button.svg';
/* exported checkBox */
const checkBox = '../content-scripts2/icons/blank-check-box.svg';
/* exported checkedBox */
const checkedBox = '../content-scripts2/icons/check-box.svg';
/* exported closeIcon */
const closeIcon = '../content-scripts2/icons/close-arrow.svg';
/* exported openIcon */
const openIcon = '../content-scripts2/icons/open-arrow.svg';
/* exported iconSize */
const iconSize = '1em';

$(document).ready(function () {
    
    var settings = {
        loggingEnabled: true,
        showActivityGraph: true
    }

    modules = {
        activityGraph: Module_ActivityGraph(),
        commentObserver: Module_CommentObserver(),
    }

    let posts = [];
    let margin = {
        top: 5,
        right: 5,
        bottom: 5,
        left: 25
    };

    modules.activityGraph.perform(Module_Settings(settings));
    $('#margin').text(JSON.stringify(margin));
    modules.activityGraph.draw(posts, $('body'), margin);

    $('#marginLeftLess').click(function () {
        margin.left = margin.left - 1;
        $('#margin').text(JSON.stringify(margin));
        modules.activityGraph.draw(posts, $('body'), margin);
    });

    $('#marginLeftMore').click(function () {
        margin.left = margin.left + 1;
        $('#margin').text(JSON.stringify(margin));
        modules.activityGraph.draw(posts, $('body'), margin);
    });

    $('#marginRightLess').click(function () {
        margin.right = margin.right - 1;
        $('#margin').text(JSON.stringify(margin));
        modules.activityGraph.draw(posts, $('body'), margin);
    });

    $('#marginRightMore').click(function () {
        margin.right = margin.right + 1;
        $('#margin').text(JSON.stringify(margin));
        modules.activityGraph.draw(posts, $('body'), margin);
    });

    $('#marginTopLess').click(function () {
        margin.top = margin.top - 1;
        $('#margin').text(JSON.stringify(margin));
        modules.activityGraph.draw(posts, $('body'), margin);
    });

    $('#marginTopMore').click(function () {
        margin.top = margin.top + 1;
        $('#margin').text(JSON.stringify(margin));
        modules.activityGraph.draw(posts, $('body'), margin);
    });

    $('#marginBottomLess').click(function () {
        margin.bottom = margin.bottom - 1;
        $('#margin').text(JSON.stringify(margin));
        modules.activityGraph.draw(posts, $('body'), margin);
    });

    $('#marginBottomMore').click(function () {
        margin.bottom = margin.bottom + 1;
        $('#margin').text(JSON.stringify(margin));
        modules.activityGraph.draw(posts, $('body'), margin);
    });    

});