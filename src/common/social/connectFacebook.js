angular.module( 'Morsel.common.connectFacebook', [] )

//connect (sign up/login) with facebook SDK
.directive('mrslConnectFacebook', function(ApiUsers, $state, $q, HandleErrors, $modal, $rootScope, AfterLogin){
  return {
    restrict: 'A',
    scope: false,
    replace: true,
    link: function(scope, element, attrs) {
      var loginResponse,
          userInfoDeferred;

      if(!window.fbAsyncInit) {
        window.fbAsyncInit = function() {
          FB.init({
            appId      : '1402286360015732',
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
          if(resp && resp.data) {
            //just sign them in
            login();
          } else {
            //otherwise get some stuff from FB to start sign up process
            gatherSignUpData();
          }
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
          scope.userData.social.type = 'facebook';
          //social token
          scope.userData.social.token = loginResponse.authResponse.accessToken;

          //send to main form
          $state.go('join.basicInfo');
        });
      }

      function getUserInfo() {
        userInfoDeferred = $q.defer();

        FB.api('/me', function(myInfo) {
          //store our basic user info so we can prepopulate form
          //use extend so we don't overwrite the picture
          _.extend(scope.userData.social, myInfo);

          //check to see if this user's email is already in use on morsel
          ApiUsers.validateEmail(myInfo.email).then(function(resp){
            //if not, resolve and they'll continue on to signup
            userInfoDeferred.resolve();
          }, function(resp) {
            //if this email already exists...
            if(resp.data && resp.data.errors && resp.data.errors.email && (_.indexOf(resp.data.errors.email, 'has already been taken')>=0)) {
              //pop an overlay prompting user to associated fb data to existing morsel account
              existingAccountModal();
            } else {
              //the email wasn't valid - just scrap it, move to sign up
              scope.userData.social.email = '';
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
          scope.userData.social.picture = myPicture;
          deferred.resolve();
        });

        return deferred.promise;
      }

      function existingAccountModal() {
        var ModalInstanceCtrl = function ($scope, $modalInstance, scopeWithData, userInfoDeferred) {
          $scope.email = scopeWithData.userData.social.email;

          //if user cancels, allow fb info to go through, but strip out email
          $scope.cancel = function () {
            scopeWithData.userData.social.email = '';
            $modalInstance.dismiss('cancel');
            userInfoDeferred.resolve();
          };

          $scope.combineAccounts = function() {
            AfterLogin.addCallbacks(function() {
              ApiUsers.updateUser(scopeWithData.userData.registered.id, {
                'authentication': {
                  'provider': 'facebook',
                  'token': loginResponse.authResponse.accessToken
                }
              }).then(function() {
                //send them somewhere?
              });
            });
            $location.path('/account/login');
          };

          $rootScope.$on('$locationChangeSuccess', function () {
            $modalInstance.dismiss('cancel');
          });
        };
        //we need to implicitly inject dependencies here, otherwise minification will botch them
        ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'scopeWithData', 'userInfoDeferred'];

        var modalInstance = $modal.open({
          templateUrl: 'common/user/duplicateEmailOverlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            //pass the outside scope
            scopeWithData: function () {
              return scope;
            },
            userInfoDeferred: function () {
              return userInfoDeferred;
            }
          }
        });
      }

      function login() {
       var authenticationData = {
            'authentication': {
              'provider': 'facebook',
              'token': loginResponse.authResponse.accessToken
            }
          };

        Auth.login(userData, onLoginSuccess, onLoginError);
      }

      function onLoginSuccess(resp) {
        //if successfully logged in check if we have anything in the to-do queue
        if(AfterLogin.hasCallbacks()) {
          AfterLogin.executeCallbacks();
        } else {
          //or else send them somewhere
          alert('logged in!');
        }
      }

      function onLoginError(resp) {
        alert('error!');
        //how to handle errors?
        //HandleErrors.onError(resp, $scope.loginForm);
      }
    },
    template: '<a ng-click="connectFacebook()">Connect with Facebook</a>'
  };
});