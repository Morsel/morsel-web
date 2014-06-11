angular.module( 'Morsel.common.addFacebook', [] )

//associate a facebook account to an existing morsel account
.directive('mrslAddFacebook', function(ApiUsers, FacebookApi, HandleErrors){
  return {
    restrict: 'A',
    scope: {
      btnText: '@mrslAddFacebookText',
      form: '=mrslAddFacebookForm',
      authentication: '=mrslAddAuthentication'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var loginResponse;

      FacebookApi.init();

      scope.add = function() {
        FacebookApi.login(function(response) {
          loginResponse = response;

          if (loginResponse.status === 'connected') {
            // user is logged into your app and Facebook.
            if(loginResponse.authResponse && loginResponse.authResponse.userID) {
              createAuthentication();
            }
          }
        });
      };

      scope.remove = function() {
        //pop a confirm dialog
        if (confirm("Are you sure you want to disconnect your Facebook account?")) {
          ApiUsers.deleteAuthentication(scope.authentication.id).then(function(authenticationResp){
            scope.authentication = null;
          }, onAuthenticationError);
        }
      };

      function createAuthentication() {
        var authenticationData = {
              'authentication': {
                'provider': 'facebook',
                'token': loginResponse.authResponse.accessToken,
                //tokens coming from the JS SDK are short-lived
                'short_lived': true,
                'uid': loginResponse.authResponse.userID
              }
            };

        ApiUsers.createAuthentication(authenticationData).then(function(authenticationResp){
          scope.authentication = authenticationResp.data;
        }, onAuthenticationError);
      }

      function onAuthenticationError(resp) {
        HandleErrors.onError(resp.data, scope.form);
      }
    },
    templateUrl: 'common/social/addFacebook.tpl.html'
  };
});