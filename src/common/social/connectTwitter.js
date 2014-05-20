angular.module( 'Morsel.common.connectTwitter', [] )

//connect (sign up/login) with twitter Oauth (handled on server)
.directive('mrslConnectTwitter', function(ApiUsers, $state, $q, HandleErrors, $modal, $rootScope, AfterLogin, Auth, $window){
  return {
    restrict: 'A',
    scope: {
      btnText: '@mrslConnectTwitterText',
      form: '=mrslConnectTwitterForm'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var loginResponse,
          userInfoDeferred,
          tData = MorselConfig.twitterData;

      //check if there is any twitter initialization data on the page
      if(tData) {
        //if there are errors, show them
        if(tData.errors) {
          HandleErrors.onError(tData, scope.form);
        } else {
          //else there's user info, check their authentication details
          checkAuthentication();
        }
      }

      //decide whether to sign them up or log them in
      function checkAuthentication() {
        ApiUsers.checkAuthentication('facebook', tData.id_str).then(function(resp){
          //if we already have them on file
          if(resp.data) {
            //just sign them in
            login();
          } else {
            //otherwise see if they exist on morsel (how?)
            validateEmail();
            //otherwise fill in some info to start sign up process
            //if they have a profile image, use it
            if(!tData.default_profile_image) {
              $scope.userData.social.picture = tData.profile_image_url;
            }

            $scope.userData.social.first_name = tData.name;
            $scope.userData.social.id = tData.id_str;
            $scope.userData.social.type = 'twitter';
            $scope.userData.social.token = tData.userData.token
            $scope.userData.social.short_lived = false;

            //send to main form
            $state.go('join.basicInfo');
          }
        });
      }

      function validateEmail() {
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
              'provider': 'twitter',
              'token': tData.userData.token,
              'secret': tData.userData.secret,
              //tokens coming from twitter are long-lived
              'short_lived': false,
              'uid': tData.id_str
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
    template: '<a href="/auth/twitter/connect" class="btn btn-social btn-twitter btn-lg" target="_self"><i class="common-share-twitter"></i>{{btnText}}</a>'
  };
});