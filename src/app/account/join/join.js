angular.module( 'Morsel.account.join', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'join', {
    url: '/account/join',
    views: {
      "main": {
        controller: 'JoinCtrl',
        templateUrl: 'app/account/join/join.tpl.html'
      }
    },
    data:{
      pageTitle: 'Join Morsel'
    }
  })
  .state( 'join.landing', {
    views: {
      "landing": {
        controller: 'LandingCtrl',
        templateUrl: 'app/account/join/landing.tpl.html'
      }
    }
  })
  .state( 'join.basicInfo', {
    views: {
      "basicInfo": {
        controller: 'BasicInfoCtrl',
        templateUrl: 'app/account/join/basicInfo.tpl.html'
      }
    }
  });
})

.controller( 'JoinCtrl', function JoinCtrl( $scope, $state ) {
  //immediately send them
  $state.go('join.landing');
})

.controller( 'LandingCtrl', function LandingCtrl( $scope, ApiUsers, $state ) {
  //our authentication code

  //facebook
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '1402286360015732',
      cookie     : true,  // enable cookies to allow the server to access 
                          // the session
      xfbml      : true,  // parse social plugins on this page
      version    : 'v2.0' // use version 2.0
    });
  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  $scope.signupFacebook = function() {
    FB.login(function(response) {
      if (response.status === 'connected') {
        // user is logged into your app and Facebook.
        if(response.authResponse && response.authResponse.userID) {
          ApiUsers.checkAuthentication('facebook', response.authResponse.userID). then(function(resp){
            //if we already have them on file, just sign them in
            console.log(resp);
            //come back to this!
          }, function(resp) {
            //otherwise send them to get some basic info
            $state.go('join.basicInfo');
          });
        }
      }
    }, {
      scope: 'public_profile,email,user_friends'
    });
  };

  $scope.joinEmail = function() {
    $state.go('join.basicInfo');
  };
})

.controller( 'BasicInfoCtrl', function BasicInfoCtrl( $scope ) {
  
});
