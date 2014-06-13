angular.module( 'Morsel.common.facebookApi', [] )

// FacebookApi is the middleman for dealing with requests/initialization of fb
.factory('FacebookApi', function($q, ApiUsers) {
  var fb = {},
      sdkLoaded = false;

  fb.init = function(callback) {
    // Load the SDK asynchronously if it hasn't been yet
    if(sdkLoaded) {
      //loaded already, call our callback immediately
      callback();
    } else {
      window.fbAsyncInit = function() {
        FB.init({
          appId      : window.MorselConfig.facebookAppId,
          cookie     : true,  // enable cookies to allow the server to access 
                              // the session
          xfbml      : false,  // parse social plugins on this page
          version    : 'v2.0' // use version 2.0
        });

        sdkLoaded = true;

        callback();
      };

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
        callback(response);
      }
      else {
        FB.login(callback, {
          //grab this stuff from fb
          scope: 'public_profile,email,user_friends'
        });
      }
    });
  };

  //needs to be called whenever a user logs into facebook while already logged into morsel
  fb.updateToken = function(token, callback) {
    var authenticationData = {
      'authentication': {
        'token': token
      }
    };

    ApiUsers.getAuthentications().then(function(authenticationsResp){
      var fbAuth = _.find(authenticationsResp.data, function(auth) {
        return auth.provider === 'facebook';
      });

      if(fbAuth) {
        ApiUsers.updateAuthentication(fbAuth.id, authenticationData).then(function(){
          callback();
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

  fb.getFriends = function(callback) {
    FB.api('/me/friends', callback);
  };

  return fb;
});