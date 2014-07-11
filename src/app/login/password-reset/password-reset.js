angular.module( 'Morsel.login.passwordReset', [])

.config(function config( $stateProvider ) {
  //these are totally separate states - same file for convenience
  $stateProvider.state( 'auth.password-reset-enter-email', {
    url: '/password-reset',
    parent: 'auth',
    views: {
      "auth-view": {
        controller: 'PasswordResetEnterEmailCtrl',
        templateUrl: 'app/login/password-reset/enter-email.tpl.html'
      }
    },
    data:{ pageTitle: 'Password Reset' }
  }).state( 'auth.password-reset-new-password', {
    url: '/password-reset/new?reset_password_token',
    parent: 'auth',
    views: {
      "auth-view": {
        controller: 'PasswordResetNewPasswordCtrl',
        templateUrl: 'app/login/password-reset/new-password.tpl.html'
      }
    },
    data:{ pageTitle: 'Password Reset - Choose Password' }
  });
})

.controller( 'PasswordResetEnterEmailCtrl', function PasswordResetEnterEmailCtrl( $scope, ApiUsers, HandleErrors ) {
  //model to store our email data
  $scope.emailPasswordModel = {};

  //called on submit of password reset form
  $scope.submitEmail = function() {
    var email = {
      email: $scope.emailPasswordModel.email
    };

    //check if everything is valid
    if($scope.emailPasswordForm.$valid) {
      //disable form while request fires
      $scope.emailPasswordForm.$setValidity('loading', false);

      ApiUsers.forgotPassword(email).then(onSuccess, onError);
    }
    
    function onSuccess(resp) {
      //make form valid again
      $scope.emailPasswordForm.$setValidity('loading', true);

      //remove the form
      $scope.emailSubmitted = true;

      //if email successfully sent, show message
      $scope.alertMessage = 'A link has been sent to '+$scope.emailPasswordModel.email+' containing instructions for how to complete the password reset process.';
      $scope.alertType = 'success';
    }

    function onError(resp) {
      //make form valid again (until errors show)
      $scope.emailPasswordForm.$setValidity('loading', true);

      HandleErrors.onError(resp.data, $scope.emailPasswordForm);
    }
  };
})

.controller( 'PasswordResetNewPasswordCtrl', function PasswordResetNewPasswordCtrl( $scope, $stateParams, ApiUsers, HandleErrors, $sce ) {
  //model to store our password data
  $scope.newPasswordModel = {};

  //custom validation configs for password verification
  $scope.customMatchVer = {
    'match': {
      'matches': 'password',
      'message': 'Passwords don\'t match'
    }
  };

  //called on submit of password reset form
  $scope.submitNewPassword = function() {
    var passwordData = {
      password: $scope.newPasswordModel.password,
      reset_password_token: $stateParams.reset_password_token
    };

    //check if everything is valid
    if($scope.newPasswordForm.$valid) {
      //disable form while request fires
      $scope.newPasswordForm.$setValidity('loading', false);

      ApiUsers.resetPassword(passwordData).then(onSuccess, onError);
    }
    
    function onSuccess(resp) {
      //make form valid again
      $scope.newPasswordForm.$setValidity('loading', true);

      //if password reset, show message
      $scope.alertMessage = $sce.trustAsHtml('Your password has been reset. You can now <a href="/auth/login">login</a> with your new password');
      $scope.alertType = 'success';
    }

    function onError(resp) {
      //make form valid again (until errors show)
      $scope.newPasswordForm.$setValidity('loading', true);

      HandleErrors.onError(resp.data, $scope.newPasswordForm);
    }
  };
});