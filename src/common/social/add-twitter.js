angular.module( 'Morsel.common.addTwitter', [] )

//associate a twitter account to an existing morsel account
.directive('mrslAddTwitter', function(ApiUsers, HandleErrors){
  return {
    restrict: 'A',
    scope: {
      btnText: '@mrslAddTwitterText',
      form: '=mrslAddTwitterForm',
      authentication: '=mrslAddAuthentication'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var tData = MorselConfig.twitterData;

      //check if there is any twitter initialization data on the page
      if(tData) {
        //remove the on-page config data now that he have it locally
        MorselConfig.twitterData = null;

        //if there are errors, show them
        if(tData.errors) {
          HandleErrors.onError(tData, scope.form);
        } else {
          //else there's user info, create an authentication
          createAuthentication();
        }
      }

      scope.remove = function() {
        //pop a confirm dialog
        if (confirm("Are you sure you want to disconnect your Twitter account?")) {
          ApiUsers.deleteAuthentication(scope.authentication.id).then(function(authenticationResp){
            scope.authentication = null;
          }, onAuthenticationError);
        }
      };

      function createAuthentication() {
        var authenticationData = {
              'authentication': {
                'provider': 'twitter',
                'token': tData.userData.token,
                'secret': tData.userData.secret,
                'short_lived': false,
                'uid': tData.id_str
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
    templateUrl: 'common/social/addTwitter.tpl.html'
  };
});