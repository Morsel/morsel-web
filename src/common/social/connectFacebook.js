angular.module( 'Morsel.common.connectFacebook', [] )

//connect (sign up/login) with facebook SDK
.directive('mrslConnectFacebook', function(ApiUsers, $state, $q, HandleErrors, AfterLogin, Auth, $window, $location){
  return {
    restrict: 'A',
    scope: {
      btnText: '@mrslConnectFacebookText',
      form: '=mrslConnectFacebookForm'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var loginResponse,
          userInfoDeferred,
          loginNext;

      if($state && $state.params && $state.params.next) {
        loginNext = $state.params.next;
      }

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

      scope.connectFacebook = function() {
        FB.login(function(response) {
          var fbUserPromise,
              fbPicturePromise;

          loginResponse = response;

          if (loginResponse.status === 'connected') {
            // user is logged into your app and Facebook.
            if(loginResponse.authResponse && loginResponse.authResponse.userID) {
              checkAuthentication();
            }
          }
        }, {
          //grab this stuff from fb
          scope: 'public_profile,email,user_friends'
        });
      };

      //decide whether to sign them up or log them in
      function checkAuthentication() {
        ApiUsers.checkAuthentication('facebook', loginResponse.authResponse.userID).then(function(resp){
          //if we already have them on file
          if(resp.data) {
            //just sign them in
            login();
          } else {
            //otherwise get some stuff from FB to start sign up process
            gatherSignUpData();
          }
        }, function(resp) {
          HandleErrors.onError(resp.data, scope.form);
        });
      }

      function gatherSignUpData() {
        //basic fb info
        fbUserPromise = getUserInfo();
        //and get user's picture
        fbPicturePromise = getUserPicture();

        //once all promises are resolved with data from fb, send to main form
        $q.all([fbUserPromise, fbPicturePromise]).then(function(){
          //where we pulled the data
          scope.$parent.userData.social.type = 'facebook';
          //social token
          scope.$parent.userData.social.token = loginResponse.authResponse.accessToken;

          //fb sends short-lived tokens
          scope.$parent.userData.social.short_lived = true;

          //send to main form
          $state.go('join.basicInfo');
        });
      }

      function getUserInfo() {
        userInfoDeferred = $q.defer();

        FB.api('/me', function(myInfo) {
          //store our basic user info so we can prepopulate form
          //use extend so we don't overwrite the picture
          _.extend(scope.$parent.userData.social, myInfo);

          //check to see if this user's email is already in use on morsel
          ApiUsers.validateEmail(myInfo.email).then(function(resp){
            //if not, resolve and they'll continue on to signup
            userInfoDeferred.resolve();
          }, function(resp) {
            //if this email already exists...
            if(resp.data && resp.data.errors && resp.data.errors.email && (_.indexOf(resp.data.errors.email, 'has already been taken')>=0)) {
              //show errors
              HandleErrors.onError(resp.data, scope.form);
            } else {
              //the email wasn't valid - just scrap it, move to sign up
              scope.$parent.userData.social.email = '';
              userInfoDeferred.resolve();
            }
          });
        });

        return userInfoDeferred.promise;
      }

      function getUserPicture() {
        var deferred = $q.defer();

        FB.api('/me/picture', {
          'width': '144',
          'height': '144'
        }, function(myPicture) {
          //store our picture info so we can prepopulate form
          scope.$parent.userData.social.picture = myPicture;
          deferred.resolve();
        });

        return deferred.promise;
      }

      function login() {
       var authenticationData = {
            'authentication': {
              'provider': 'facebook',
              'token': loginResponse.authResponse.accessToken,
              //tokens coming from the JS SDK are short-lived
              'short_lived': true,
              'uid': loginResponse.authResponse.userID
            }
          };

        Auth.login(authenticationData).then(onLoginSuccess, onLoginError);
      }

      function onLoginSuccess(resp) {
        //if successfully logged in check if we have anything in the to-do queue
        if(AfterLogin.hasCallback()) {
          AfterLogin.goToCallbackPath();
        } else {
          //send them home (trigger page refresh to switch apps)
          sendToNextUrl();
        }
      }

      function onLoginError(resp) {
        HandleErrors.onError(resp.data, scope.form);
      }

      function sendToNextUrl() {
        //if the user was trying to get somewhere that's not able to be accessed until logging in, go there now, else go home

        //send them to the login page
        $window.location.href = loginNext ? loginNext : '/';
      }
    },
    template: '<a ng-click="connectFacebook()" class="btn btn-social btn-facebook btn-lg"><i class="common-share-facebook"></i>{{btnText}}</a>'
  };
});