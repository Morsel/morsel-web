angular.module( 'Morsel.account.accountSettings', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'account.account-settings', {
    url: '/account-settings',
    parent: 'account',
    views: {
      "account-body": {
        controller: 'AccountSettingsCtrl',
        templateUrl: 'app/account/account-settings/account-settings.tpl.html'
      }
    },
    data:{
      pageTitle: 'Account Settings'
    },
    access: {
      restricted : true
    }
  });
})

.controller( 'AccountSettingsCtrl', function AccountSettingsCtrl($scope, ApiUsers, HandleErrors, accountUser, Auth){
  //model to store our account settings
  $scope.accountSettingsModel = _.clone(accountUser);

  //custom validation configs for password verification
  $scope.customMatchVer = {
    'match': {
      'matches': 'password',
      'message': 'Passwords don\'t match'
    }
  };
  
  //submit our form
  $scope.updateAccountSettings = function() {
    var userData = {
          user: {
            'email': $scope.accountSettingsModel.email,
            'password': $scope.accountSettingsModel.password,
            'current_password': $scope.accountSettingsModel.current_password
          }
        };

    //check if everything is valid
    if($scope.accountSettingsForm.$valid) {
      //disable form while request fires
      $scope.accountSettingsForm.$setValidity('loading', false);

      //call our updateUser method to take care of the heavy lifting
      ApiUsers.updateUser($scope.accountSettingsModel.id, userData).then(onSuccess, onError);
    }
  };

  function onSuccess(resp) {
    //make form valid again
    $scope.accountSettingsForm.$setValidity('loading', true);

    //update our scoped current user
    Auth.updateUserWithData(resp.data);
    $scope.alertMessage = 'Successfully updated your account settings';
    $scope.alertType = 'success';
  }

  function onError(resp) {
    //make form valid again (until errors show)
    $scope.accountSettingsForm.$setValidity('loading', true);

    //remove whatever message is there
    $scope.alertMessage = null;

    HandleErrors.onError(resp.data, $scope.accountSettingsForm);
  }
});
