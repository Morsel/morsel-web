angular.module( 'Morsel.login.login', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'login', {
    url: '/login',
    views: {
      "main": {
        controller: 'LoginCtrl',
        templateUrl: 'app/login/login/login.tpl.html'
      }
    },
    data:{ pageTitle: 'Login' }
  });
})

.controller( 'LoginCtrl', function LoginCtrl( $scope, $stateParams, Auth, $window, HandleErrors, AfterLogin ) {
  //model to store our join data
  $scope.loginModel = {
    'test':'value'
  };

  //called on submit of login form
  $scope.login = function() {
    var userData = {
      'user': {
        'login': $scope.loginModel.login,
        'password': $scope.loginModel.password
      }
    };

    //check if everything is valid
    if($scope.loginForm.$valid) {
      Auth.login(userData).then(onSuccess, onError);
    }
    
    function onSuccess(resp) {
      //if successfully jogged in check if we have anything in the to-do queue
      if(AfterLogin.hasCallbacks()) {
        AfterLogin.executeCallbacks();
      } else {
        //send them home (trigger page refresh to switch apps)
        $window.location.href = '/';
      }
    }

    function onError(resp) {
      //wipe out last password
      $scope.loginModel.password = '';
      //set pristine so error handling doesn't trigger immediately
      $scope.loginForm.password.$setPristine();
      HandleErrors.onError(resp.data, $scope.loginForm);
    }
  };
});