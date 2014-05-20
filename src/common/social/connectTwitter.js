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
        //remove the on-page config data now that he have it locally
        MorselConfig.twitterData = null;

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
        ApiUsers.checkAuthentication('twitter', tData.id_str).then(function(resp){
          var firstNameSpace;

          //if we already have them on file
          if(resp.data) {
            //just sign them in
            login();
          } else {
            //otherwise fill in some info to start sign up process
            //if they have a profile image, use it
            if(!tData.default_profile_image) {
              scope.$parent.userData.social.picture = tData.profile_image_url;
            }

            firstNameSpace = tData.name.indexOf(' ');

            scope.$parent.userData.social.first_name = tData.name.substring(firstNameSpace, 0);
            scope.$parent.userData.social.last_name = tData.name.substring(firstNameSpace+1);
            scope.$parent.userData.social.id = tData.id_str;
            scope.$parent.userData.social.type = 'twitter';
            scope.$parent.userData.social.token = tData.userData.token;
            scope.$parent.userData.social.secret = tData.userData.secret;
            scope.$parent.userData.social.short_lived = false;

            //send to main form
            $state.go('join.basicInfo');
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