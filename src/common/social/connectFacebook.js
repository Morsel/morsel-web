angular.module( 'Morsel.common.connectFacebook', [] )

//connect (sign up/login) with facebook SDK
.directive('mrslConnectFacebook', function(ApiUsers, $state, $q, HandleErrors, $modal, $rootScope, AfterLogin, Auth, $window){
  return {
    restrict: 'A',
    scope: {
      btnText: '@mrslConnectFacebookText',
      form: '=mrslConnectFacebookForm'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var loginResponse,
          userInfoDeferred;

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
          scope: 'public_profile,email'
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
              //pop an overlay prompting user to associated fb data to existing morsel account
              existingAccountModal();
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

      function existingAccountModal() {
        var ModalInstanceCtrl = function ($scope, $modalInstance, $location, $window, scopeWithData, userInfoDeferred) {
          $scope.email = scopeWithData.$parent.userData.social.email;

          //if user cancels, allow fb info to go through, but strip out email
          $scope.cancel = function () {
            scopeWithData.$parent.userData.social.email = '';
            $modalInstance.dismiss('cancel');
            userInfoDeferred.resolve();
          };

          $scope.combineAccounts = function() {
            AfterLogin.addCallbacks(function() {
              ApiUsers.createUserAuthentication({
                'authentication': {
                  'provider': 'facebook',
                  'token': loginResponse.authResponse.accessToken,
                  //tokens coming from the JS SDK are short-lived
                  'short_lived': true,
                  'uid': scopeWithData.$parent.userData.social.id
                }
              }).then(function() {
                //send them home (trigger page refresh to switch apps)
                $window.location.href = '/';
              }, function(resp) {
                console.log(resp);
              });
            });
            $location.path('/login');
          };

          $rootScope.$on('$locationChangeSuccess', function () {
            $modalInstance.dismiss('cancel');
          });
        };
        //we need to implicitly inject dependencies here, otherwise minification will botch them
        ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', '$location', '$window', 'scopeWithData', 'userInfoDeferred'];

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
        if(AfterLogin.hasCallbacks()) {
          AfterLogin.executeCallbacks();
        } else {
          //send them home (trigger page refresh to switch apps)
          $window.location.href = '/';
        }
      }

      function onLoginError(resp) {
        HandleErrors.onError(resp.data, scope.form);
      }
    },
    template: '<a ng-click="connectFacebook()" class="btn btn-social btn-facebook btn-lg"><i class="common-share-facebook"></i>{{btnText}}</a>'
  };
});