angular.module( 'Morsel.account.socialAccounts', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'account.social-accounts', {
    url: '/social-accounts',
    parent: 'account',
    views: {
      "account-body": {
        controller: 'SocialAccountsCtrl',
        templateUrl: 'app/account/socialAccounts/socialAccounts.tpl.html'
      }
    },
    data:{
      pageTitle: 'Social Accounts'
    },
    access: {
      restricted : true
    },
    resolve: {
      //get all the authentications before the page loads
      authentications: function(ApiUsers, $q){
        var deferred = $q.defer();

        ApiUsers.getAuthentications().then(function(authenticationsResp){
          var authentications = {};

          //go through authentication array and add each as an object with the provider as the key so we can pass to individual social account directives
          _.each(authenticationsResp.data, function(auth) {
            authentications[auth.provider] = auth;
          });
          deferred.resolve(authentications);
        });

        return deferred.promise;
      }
    }
  });
})

.controller( 'SocialAccountsCtrl', function SocialAccountsCtrl( $scope, authentications, accountUser, ApiUsers, HandleErrors, Auth ){
  $scope.authentications = authentications;

  //convert to strings for ng-model matching
  if(accountUser.settings.auto_follow) {
    accountUser.settings.auto_follow = 'on';
  } else {
    accountUser.settings.auto_follow = 'off';
  }

  $scope.userSettings = accountUser.settings;

  $scope.updateAutofollow = function() {
    var userData = {
          user: {
            settings: {}
          }
        };

    if(accountUser.settings.auto_follow === 'on') {
      userData.user.settings.auto_follow = true;
    } else {
      userData.user.settings.auto_follow = false;
    }

    ApiUsers.updateUser(accountUser.id, userData).then(onSuccess, onError);
  };

  function onSuccess(resp) {
    //update our scoped current user
    Auth.updateUser(resp.data);
  }

  function onError(resp) {
    HandleErrors.onError(resp, $scope.socialAccountForm);
  }
});
