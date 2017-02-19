"use strict";

// this is the application code that runs when the popup U/I is shown

console.log("popup.js loaded");

$(document).ready(function () {

  var userTable;
  var currentVersion;
  const _browser = window.browser ? window.browser : window.chrome;
  var logging = true; // log until settings read

  function logAll(line) {
    console.log("popup.js: " + line);
  }

  function log(line) {
    if (logging) {
      logAll(line);
    }
  }

  var manifest = _browser.runtime.getManifest();
  $('#appName').text(manifest.name);
  currentVersion = manifest.version;
  $('#appVersion').text(currentVersion);

  var userTable = $('#userTable').DataTable({
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
      "render": function (data, type, full, meta) {
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

  // get the state of the settings from the U/I and return them
  function getSettings() {
    var _filteredUsers = [];

    /*
    userTable.rows().every(function (rowIdx, tableLoop, rowLoop) {
      var data = this.data();
      _filteredUsers.push(this.data());
    });
    */

    // go directly after the controls on the page
    $("#userTable tr").each(function (index, value) {
      if (index) {
        var cols = $(value).find("td");
        var data = [
          $(cols[0]).find("[type='checkbox']").is(':checked'),
          $(cols[1]).text()
        ];
        _filteredUsers.push(data);
      }
    });
    var settings = {};
    settings.filterUsers = $('#cbFilterUsers').is(':checked');
    settings.filteredUsers = _filteredUsers;

    log("getSettings: " + JSON.stringify(settings));

    return settings;
  }

  // set the settings in the user interface
  function setSettings(settings) {
    $('#cbFilterUsers').attr('checked', settings.filterUsers);

    // add users to table
    userTable.clear();
    userTable.rows.add(settings.filteredUsers).draw();
  }

  // load settings from local storage
  function loadSettings() {
    _browser.runtime.sendMessage(GET_SETTINGS_MESSAGE,
      function (settings) {
        if (arguments.length < 1) {
          logAll("loadSettings: on response... no arguments: " + JSON.stringify(chrome.runtime.lastError));
        } else {
          logging = settings.logging;          
          setSettings(settings);
        }
      });
  }

  // save settings to local storage
  function saveFilterSettings() {
    var settings = getSettings();
    var msg = SET_FILTEREES_MESSAGE;
    msg.enabled = settings.filterUsers;
    msg.filteredUsers = settings.filteredUsers;
    _browser.runtime.sendMessage(msg, function () {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, msg);
        log("SET_FILTEREES_MESSAGE: " +
          msg.enabled + " " + JSON.stringify(msg.filteredUsers));
      });
    });
  }

  // handle delete button in user table
  $('#userTable').on("click", ".deleteBtn", function () {
    userTable.row($(this).parents('tr')).remove().draw(false);
    saveFilterSettings();
  });

  // handle add button user table
  $('#btnAddUser').click(function () {
    log('btnAddUser clicked');
    var user = $('#nameToAdd').val().trim();
    if (user != "") {
      var settings = getSettings();
      var exists = !settings.filteredUsers.every(function (el) {
        return el[1] != user;
      });
      if (!exists) {
        // not in table. add it
        log("adding user: " + user)
        userTable.row.add([true, user]).draw();
        $('#nameToAdd').val("");
      }
    }
    saveFilterSettings();
  });

  $('#btnHelp').click(function () {
    _browser.tabs.create({
      url: "http://hollies.pw/static/ffh/" + currentVersion + "/help/"
    });
  });

  // load settings on startup
  loadSettings();
  
  // save settings on any change
  var controls = $("#userTable_wrapper").add("#cbFilterUsers");
  controls.click(function (event) {
    switch (event.target.tagName.toLowerCase()) {
      case "input":
      case "a":
        saveFilterSettings();
        break;
    }
  });
});