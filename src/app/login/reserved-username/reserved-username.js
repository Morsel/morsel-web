angular.module( 'Morsel.login.reservedUsername', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'auth.reserved-username', {
    url: '/reserved-username?reserved_username_token&email&username',
    parent: 'auth',
    views: {
      "auth-view": {
        controller: 'ReservedUsernameCtrl',
        templateUrl: 'app/login/reserved-username/reserved-username.tpl.html'
      }
    },
    data:{ pageTitle: 'Complete Sign Up' }
  });
})

.controller( 'ReservedUsernameCtrl', function ReservedUsernameCtrl( $scope, HandleErrors, Auth, $state, $stateParams, ApiUsers, $cookies, $window ) {
  //model to store our basic info data
  $scope.completeSignupModel = {
    'email': $stateParams.email,
    'username': $stateParams.username
  };

  //to store the picture a user might upload
  $scope.profilePhoto = null;

  //custom validation configs for password verification
  $scope.customMatchVer = {
    'match': {
      'matches': 'password',
      'message': 'Passwords don\'t match'
    }
  };

  //disable username and email
  $scope.fieldsDisabled = true;

  //submit our form
  $scope.completeSignupSubmit = function() {
    var passwordData = {
      password: $scope.completeSignupModel.password,
      reset_password_token: $stateParams.reserved_username_token
    };

    //check if everything is valid
    if($scope.completeSignupForm.$valid) {
      //disable form while request fires
      $scope.completeSignupForm.$setValidity('loading', false);

      ApiUsers.resetPassword(passwordData).then(onSuccess, onError);
    }
  };

  function onPasswordUpdateSuccess(userResp) {
    var user = userResp.data,
        userData = {
          user: {
            'first_name': $scope.completeSignupModel.first_name,
            'last_name': $scope.completeSignupModel.last_name,
            'professional': $scope.completeSignupModel.professional
          }
        },
        gaCookie = $cookies._ga;

    if($scope.profilePhoto) {
      userData.user.photo = $scope.profilePhoto;
    }

    if($scope.remotePhotoUrl) {
      userData.user.remote_photo_url = $scope.remotePhotoUrl;
    }

    if(gaCookie) {
      //send _ga value as __utmz until API is updated
      userData.__utmz = gaCookie;
    }

    ApiUsers.updateUser(user.id, userData).then(onUserInfoSuccess, onError);
  }

  function onUserInfoSuccess(resp) {
    //make form valid again
    $scope.completeSignupForm.$setValidity('loading', true);

    //store our user data for the next step if we need it
    $scope.userData.registered = resp;

    //if successfully joined send to the next step
    if($scope.userData.registered.professional) {
      //pros need more info
      $state.go('auth.join.additionalInfo');
    } else {
      //they're done - send um home
      $window.location.href = '/';
    }
  }

  function onError(resp) {
    //make form valid again (until errors show)
    $scope.completeSignupForm.$setValidity('loading', true);

    HandleErrors.onError(resp.data, $scope.completeSignupForm);
  }
});