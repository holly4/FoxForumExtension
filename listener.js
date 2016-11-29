// this code runs in the Chrome web page context and is sent messageges
// from the U/I to do something

var modules = undefined;

/*
var Observer = {
created: false,
observing: false,
listeners: []
}
*/

chrome.runtime.onMessage.addListener(function(options, sender, sendResponse) {
    
  if (modules === undefined) {
    modules = {
      cleanPage: Module_CleanPage(),
      disableScrolling: Module_DisableScrolling(),
      filterUsers: Module_FilterUsers(),
      showFilterComments: Module_ShowFilteredComments(),
      showLikerAvatars: Module_ShowLikerAvatars(),
    }
  };

  // log the request 
  console.log("Listener: " + options);

  // copy only users enabled for filtering to send onward
  filteredUsers = [];
  options.filteredUsers.forEach(function(item){
    if (item[0])
      filteredUsers.push(item[1]);
  });

  modules.cleanPage.perform(options.cleanPage);
  modules.disableScrolling.perform(options.disableScrolling);
  modules.filterUsers.perform(options.filterUsers, filteredUsers);
  modules.showFilterComments.perform(options.showFilteredComments);
  modules.showLikerAvatars.perform(options.showLikerAvatars);
});

// tell chrome to show the extension avatar as active
chrome.runtime.sendMessage({
  action: "show"
});