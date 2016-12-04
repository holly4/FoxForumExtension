// this is the application code that runs when the popup U/I is shown

var userTable;
var currentVersion;
var loggingEnabled = false;

const defaultSettings = {
  cleanPage : false,
  showFilteredComments : false,
  showLikerAvatars : false,
  disableScrolling : false,
  filterUsers : false,
  filteredUsers : [
    [true, "DrSigmundFreud"],
    [true, "aBeautifuIMind"],
    [true, "BruceKardashian"],
    [true, "BillsCigar"],
    [true, "HillbillyRodhamClinton"],
    [true, "FoodStampDemocrat"],
    [true, "InnocentLittleGirl"]
  ],
  version : currentVersion,
  logging : false,
};

function log(line) {
    if (loggingEnabled) {
      console.log("Popup: " + line);
    }
}

$(function() {

  var manifest = chrome.runtime.getManifest();
  $('#appName').text(manifest.name);
  currentVersion = manifest.version;
  $('#appVersion').text(currentVersion);

  userTable = $('#userTable').DataTable({
    columns: [{
      title: "",
      orderable: false,
      sorting: false,
      width: 1
    }, {
      title: "Name"
    }, {
      data: null,
      className: "center",
      defaultContent: '<a href="#" class="deleteBtn">&#10060</a>',
      orderable: false,
      width: 1
    }],
    columnDefs: [{
      orderable: false,
      sorting: false,
      "targets": 0,
      "render": function(data, type, full, meta) {
        return data ? '<input type="checkbox" checked/>' : '<input type="checkbox"/>'
      }
    }],
    order: [
      [1, "asc"]
    ],
    scrollY: "200px",
    scrollCollapse: true,
    paging: false,
    info: false,
    "searching": false
  });

  // either set options as read from worker or load them
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, "requestOptions", function(options) {
      if (options) {
        // options were received from the worker
        setOptions(options);
      } else {
        // load options from storage
        loadOptions()
      }
    });
  });

  // do this when the "Apply" button is clicked
  $('#btnApply').click(function() {
    log('btnApply clicked');

    // get the present state of the options checkboxes
    var options = getOptions();

    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, options);
    });
  });

  // do this when the "Save" button is clicked
  $('#btnSave').click(function() {
    log('btnSave clicked');
    // save the options
    saveOptions();
  });

  $('#userTable').on("click", ".deleteBtn", function() {
    userTable.row($(this).parents('tr')).remove().draw(false);
  });

  $('#btnAddUser').click(function() {
    log('btnAddUser clicked');
    var user = $('#nameToAdd').val();
    log("adding user: " + user)
    userTable.row.add([true, user]).draw();
    $('#nameToAdd').val("");
  });

  $('#btnHelp').click(function() {
    chrome.tabs.create({url: "http://hollies.pw/static/ffh/v100/help/"});
  });
});

// get the state of the options from the U/I and return them
function getOptions() {
  var _filteredUsers = [];

  userTable.rows().every(function(rowIdx, tableLoop, rowLoop) {
    _filteredUsers.push(this.data());
  });

  var options = {
    cleanPage : $('#cbCleanPage').is(':checked'),
    showFilteredComments : $('#cbShowFilteredComments').is(':checked'),
    showLikerAvatars : $('#cbShowLikerAvatars').is(':checked'),
    disableScrolling : $('#cbDisableScrolling').is(':checked'),
    filterUsers : $('#cbFilterUsers').is(':checked'),
    filteredUsers : _filteredUsers,
    version : currentVersion,
    logging : $('#cbEnableLogging').is(':checked'),
  };

  log("getOptions: " + options);

  return options;
}

// set the options in the user interface
function setOptions(options) {
    $('#cbCleanPage').attr('checked', options.cleanPage);
    $('#cbShowFilteredComments').attr('checked', options.showFilteredComments);
    $('#cbShowLikerAvatars').attr('checked', options.showLikerAvatars);
    $('#cbDisableScrolling').attr('checked', options.disableScrolling);
    $('#cbFilterUsers').attr('checked', options.filterUsers);
    $('#cbEnableLogging').attr('checked', options.logging);
    loggingEnabled = options.logging;

    // add users to table
    userTable.clear();
    userTable.rows.add(options.filteredUsers).draw();
}

// save the state of the options to local storage
function saveOptions() {
  // get the state of the options
  var options = getOptions();

  if (chrome.storage === undefined) {
    // do nothing if not running from within chrome extension
    // TODO: store mock data    
    return;
  }

  // save them to chrome storage
  chrome.storage.sync.set(options, function() {
    // this is called once settings have been stored
    // just log that they were stored
    log('settings saved: ' + options);
  });
}

// load options from local storage
function loadOptions() {
  if (chrome.storage === undefined) {
    // do nothing if not running from within chrome extension
    // TODO: provide some mock data    
    userTable.clear();
    userTable.rows.add(defaultSettings.filteredUsers).draw();

    return defaultSettings;
  }

  // sets default for initial read
  options = defaultSettings;

  // read the options from local storage
  chrome.storage.sync.get(defaultSettings, function(options) {
    // this is called once settings have been read

    if (options.filterUsers === undefined) {
      // intial saved data did not have filtered users table
      options.filterUsers = defaultSettings.filterUsers;
    }

    if (options.filteredUsers === undefined) {
      // intial saved data did not have filtered users table
      options.filteredUsers = defaultSettings.filteredUsers;
    }

    if (options.logging === undefined) {
      // intial saved data did not logging selection
      options.logging = defaultSettings.logging;
    }

    // log that the settings were read
    log("settings read: " + options);

    setOptions(options);
  });
}