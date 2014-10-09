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
      scope.add = function() {
        FacebookApi.init(function(){
          FacebookApi.login(function(response) {
            if (response.status === 'connected') {
              // user is logged into your app and Facebook.
              if(response.authResponse && response.authResponse.userID) {
                createAuthentication(response);
              }
            }
          });
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

      function createAuthentication(response) {
        var authenticationData = {
              'authentication': {
                'provider': 'facebook',
                'token': response.authResponse.accessToken,
                //tokens coming from the JS SDK are short-lived
                'short_lived': true,
                'uid': response.authResponse.userID
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