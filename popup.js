// this is the application code that runs when the popup U/I is shown

var table;
const currentVersion = '0.2.0';

$(function() {

  $('#version').text(currentVersion);

  table = $('#example').DataTable({
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
      "targets": 0, //Targets would be the 0 based index of the column
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

  // load the state of the options from persistent stoage
  var options = load_options();

  // do this when the "Apply" button is clicked
  $('#btnApply').click(function() {
    console.log('btnApply clicked');

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
    console.log('btnApply clicked');
    // save the options
    save_options();
  });

  $('#example').on("click", ".deleteBtn", function() {
    table.row($(this).parents('tr')).remove().draw(false);
  });

  $('#btnAddUser').click(function() {
    var user = $('#nameToAdd').val();
    console.log("adding user: " + user)
    table.row.add([true, user]).draw();
  });
});

// get the state of the options from the U/I and return them
function getOptions() {

  var _filteredUsers = [];

  table.rows().every(function(rowIdx, tableLoop, rowLoop) {
    _filteredUsers.push(this.data());
  });

  var options = {
    cleanPage: $('#cbCleanPage').is(':checked'),
    showFilteredComments: $('#cbShowFilteredComments').is(':checked'),
    showLikerAvatars: $('#cbShowLikerAvatars').is(':checked'),
    disableScrolling: $('#cbDisableScrolling').is(':checked'),
    filterUsers: $('#cbFilterUsers').is(':checked'),
    filteredUsers: _filteredUsers,
    version: currentVersion,
  };

  console.log(options);

  return options;
}

// save the state of the options to local storage
function save_options() {

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
    console.log('settings saved: ' + options);
  });
}

// load options from local storage
function load_options() {

  // specify the default state in case they have
  // never been stored to be read
  var defaultSettings = {
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
      [false, "HappyDaysAreHereAgain"]
    ],
    version: currentVersion,
  };

  if (chrome.storage === undefined) {
    // do nothing if not running from within chrome extension
    // TODO: provide some mock data    
    table.clear();
    table.rows.add(defaultSettings.filteredUsers).draw();

    return defaultSettings;
  }

  // read the options from local storage
  chrome.storage.sync.get(defaultSettings, function(options) {
    // this is called once settings have been read

    // log that they were read
    console.log("settings read: ", options);

    if (options.filterUsers === undefined) {
      // intial saved data did not have filtered users table
      options.filterUsers = defaultSettings.filterUsers;
    }

    if (options.filteredUsers === undefined) {
      // intial saved data did not have filtered users table
      options.filteredUsers = defaultSettings.filteredUsers;
    }

    // copy the options into the U/I
    $('#cbCleanPage').attr('checked', options.cleanPage);
    $('#cbShowFilteredComments').attr('checked', options.showFilteredComments);
    $('#cbShowLikerAvatars').attr('checked', options.showLikerAvatars);
    $('#cbDisableScrolling').attr('checked', options.disableScrolling);
    $('#cbFilterUsers').attr('checked', options.filterUsers);

    table.clear();
    table.rows.add(options.filteredUsers).draw();
  });
}