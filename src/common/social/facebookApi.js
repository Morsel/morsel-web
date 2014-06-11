angular.module( 'Morsel.common.facebookApi', [] )

// FacebookApi is the middleman for dealing with requests/initialization of fb
.factory('FacebookApi', function() {
  var fb = {};

  fb.init = function() {
    if(!window.fbAsyncInit) {
      window.fbAsyncInit = function() {
        FB.init({
          appId      : window.MorselConfig.facebookAppId,
          cookie     : true,  // enable cookies to allow the server to access 
                              // the session
          xfbml      : false,  // parse social plugins on this page
          version    : 'v2.0' // use version 2.0
        });
      };
    }

    // Load the SDK asynchronously if it hasn't been yet
    if(!window.FB) {
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }
  };

  fb.login = function(callback) {
    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        callback();
      }
      else {
        FB.login(callback, {
          //grab this stuff from fb
          scope: 'public_profile,email,user_friends'
        });
      }
    });
  };

  fb.getPicture = function(callback) {
    FB.api('/me/picture', {
      'width': '144',
      'height': '144'
    }, callback);
  };

  fb.getUserInfo = function(callback) {
    FB.api('/me', callback);
  };

  fb.getFriends = function() {
    //FB.api('/me/feed', 'post', {message: 'Hello, world!'});
  };

  return fb;
});