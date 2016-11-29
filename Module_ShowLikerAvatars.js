// module to enable the display of liker avatars

function Module_ShowLikerAvatars() {

  function log(line) {
    console.log("ShowLikerAvatars: " + line);
  }

  return {
    perform
  };

  function isEnabled() {
    return $('div.fyre span.fyre-comment-like-imgs').first().css('display') !== "none";
  }

  function perform(state) {
    log("perform " + state);

    if (state === isEnabled()) {
      // same state as before. nothing to do
      return;
    }

    if (state) {
      log("enable");
      $('head').append('<style> div.fyre span.fyre-comment-like-imgs { display: inline; } </style>');
    } else {
      log("disable");
      $('head').append('<style> div.fyre span.fyre-comment-like-imgs { display: none; } </style>');
    }
  }
}