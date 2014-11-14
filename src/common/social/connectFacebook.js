angular.module( 'Morsel.common.connectFacebook', [] )

//connect (sign up/login) with facebook SDK
.directive('mrslConnectFacebook', function(ApiUsers, $state, $q, HandleErrors, AfterLogin, Auth, $window, $location, FacebookApi, Mixpanel){
  return {
    restrict: 'A',
    scope: {
      btnText: '@mrslConnectFacebookText',
      form: '=mrslConnectFacebookForm'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var loginResponse,
          loginNext;

      if($state && $state.params && $state.params.next) {
        loginNext = $state.params.next;
      }

      scope.connectFacebook = function() {
        FacebookApi.init(function(){
          FacebookApi.login(function(response) {
            loginResponse = response;

            if (loginResponse.status === 'connected') {
              // user is logged into Facebook.
              if(loginResponse.authResponse && loginResponse.authResponse.userID) {
                checkAuthentication();
              }
            }
          });
        });
      };

      //check if we've already got their info
      function checkAuthentication() {
        ApiUsers.checkAuthentication('facebook', loginResponse.authResponse.userID).then(function(resp){
          //if we already have them on file
          if(resp.data) {
            //just sign them in
            login();
          } else {
            Mixpanel.track('Authenticated with Social', {
              social_type: 'facebook'
            });

            //otherwise get info and pic from FB to start sign up process
            gatherData();
          }
        }, function(resp) {
          HandleErrors.onError(resp.data, scope.form);
        });
      }

      function gatherData() {
        var promises = [];

        //basic fb info
        promises.push(getUserInfo());
      
        //user's picture
        promises.push(getUserPicture());

        //once all promises are resolved with data from fb, call callback
        $q.all(promises).then(updateSignupData);
      }

      function updateSignupData() {
        //where we pulled the data
        scope.$parent.userData.social.type = 'facebook';
        //social token
        scope.$parent.userData.social.token = loginResponse.authResponse.accessToken;

        //fb sends short-lived tokens
        scope.$parent.userData.social.short_lived = true;

        //send to main form
        $state.go('auth.join.basicInfo');
      }

      function getUserInfo() {
        var userInfoDeferred = $q.defer();

        FacebookApi.getUserInfo(function(myInfo) {
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

        FacebookApi.getPicture(function(myPicture) {
          if(myPicture.data && !myPicture.data.is_silhouette) {
            //store our picture info so we can prepopulate form
            scope.$parent.userData.social.pictureUrl = myPicture.data.url;
          }
          
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
        Mixpanel.track('Logged in', {
          login_type: 'facebook'
        }, function() {
          //if successfully logged in check if we have anything in the to-do queue
          if(AfterLogin.hasCallback()) {
            AfterLogin.goToCallbackPath();
          } else {
            //send them home (trigger page refresh to switch apps)
            sendToNextUrl();
          }
        });
      }

      function onLoginError(resp) {
        HandleErrors.onError(resp.data, scope.form);
      }

      function sendToNextUrl() {
        //if the user was trying to get somewhere that's not able to be accessed until logging in, go there now, else go to feed

        //send them to the login page
        $window.location.href = loginNext ? loginNext : '/feed';
      }
    },
    template: '<a ng-click="connectFacebook()" class="btn btn-social btn-facebook btn-lg">{{btnText}}</a>'
  };
});