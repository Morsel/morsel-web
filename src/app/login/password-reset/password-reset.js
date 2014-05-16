angular.module( 'Morsel.login.passwordReset', [])

.config(function config( $stateProvider ) {
  //these are totally separate states - same file for convenience
  $stateProvider.state( 'password-reset-enter-email', {
    url: '/password-reset',
    views: {
      "main": {
        controller: 'PasswordResetEnterEmailCtrl',
        templateUrl: 'app/login/password-reset/enter-email.tpl.html'
      }
    },
    data:{ pageTitle: 'Password Reset' }
  }).state( 'password-reset-new-password', {
    url: '/password-reset/new?reset_password_token',
    views: {
      "main": {
        controller: 'PasswordResetNewPasswordCtrl',
        templateUrl: 'app/login/password-reset/new-password.tpl.html'
      }
    },
    data:{ pageTitle: 'Password Reset - Choose Password' },
    resolve: {
      passwordToken: function($stateParams, $location) {
        //if user doesn't have a reset_password_token as a query param
        if(!$stateParams.reset_password_token) {
          $location.$$search = {};
          $location.path('/password-reset');
        }
      }
    }
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
      ApiUsers.forgotPassword(email).then(onSuccess, onError);
    }
    
    function onSuccess(resp) {
      //if email successfully sent, show message
      $scope.alertMessage = 'A link has been sent to your email address containing instructions for how to complete the password reset process.';
      $scope.alertType = 'success';
    }

    function onError(resp) {
      HandleErrors.onError(resp.data, $scope.emailPasswordForm);
    }
  };
})

.controller( 'PasswordResetNewPasswordCtrl', function PasswordResetNewPasswordCtrl( $scope, $stateParams, ApiUsers, HandleErrors ) {
  //model to store our password data
  $scope.newPasswordModel = {};

  //called on submit of password reset form
  $scope.submitNewPassword = function() {
    var passwordData = {
      password: $scope.newPasswordModel.password,
      reset_password_token: $stateParams.reset_password_token
    };

    //check if everything is valid
    if($scope.newPasswordForm.$valid) {
      ApiUsers.resetPassword(passwordData).then(onSuccess, onError);
    }
    
    function onSuccess(resp) {
      //if password reset, show message
      $scope.alertMessage = 'Your password has been reset. You can now <a href="/login">login</a> with your new password';
      $scope.alertType = 'success';
    }

    function onError(resp) {
      HandleErrors.onError(resp.data, $scope.newPasswordForm);
    }
  };
});