// this is the application code that runs when the popup U/I is shown

$(function () {
    // load the state of the options from persistent stoage
    load_options();

    // do this when the "Load" button is clicked
    $('#btnApply').click(function () {

        // get the present state of the options checkboxes
        var options = getOptions();

        // TODO: These four could be combined by sending the options
        if (options.cleanPage) {
            // the cleanPage option is set so tell the listener to do that
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "cleanPage" });
            });
        }

        if (options.showFilteredComments) {
            // the showFilteredComments option is set so tell the listener to do that
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "showFilteredComments" });
            });
        }

        if (options.showLikerAvatars) {
            // the showLikerAvatars option is set so tell the listener to do that
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "showLikerAvatars" });
            });
        }

        if (options.disableScrolling) {
            // the disableScrolling option is set so tell the listener to do that
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "disableScrolling" });
            });
        }
    });

    // do this when the "Load" button is clicked
    $('#btnSave').click(function () {
        // save the options
        save_options();
    });
});

// get the state of the options from the U/I and return them
function getOptions()
{
    var options = {
        cleanPage: $('#cbCleanPage').is(':checked'),
        showFilteredComments: $('#cbShowFilteredComments').is(':checked'),
        showLikerAvatars: $('#cbShowLikerAvatars').is(':checked'),
        disableScrolling: $('#cbDisableScrolling').is(':checked'),        
    };

    return options;
}

// save the state of the options to local storage
function save_options() {
    // get the state of the options
    var options = getOptions();

    // save them to chrome storage
    chrome.storage.sync.set(options, function () {
        // this is called once settings have been stored
        // just log that they were stored
        console.log('settings saved');
    });
}

// load options from local storage
function load_options() {
    // specify the default state in case they have
    // never been stored to be read
    var defaultSettings = {
        cleanPage: false,
        showFilteredComments: false,
        showLikerAvatars: false,    
        disableScrolling : false    
    };
   
    // read the options from local storage
    chrome.storage.sync.get(defaultSettings, function (items) {
        // this is called once settings have been read

        // log that they were read
        console.log("settings read: ", items);

        // copy the options into the U/I
        $('#cbCleanPage').attr('checked', items.cleanPage);
        $('#cbShowFilteredComments').attr('checked', items.showFilteredComments);
        $('#cbShowLikerAvatars').attr('checked', items.showLikerAvatars);
        $('#cbDisableScrolling').attr('checked', items.disableScrolling);
    });
}