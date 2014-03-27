angular.module( 'Morsel.login', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'login', {
    url: '/login',
    views: {
      "main": {
        controller: 'LoginCtrl',
        templateUrl: 'login/login.tpl.html'
      }
    },
    data:{ pageTitle: 'Login' }
  });
})

.controller( 'LoginCtrl', function LoginCtrl( $scope, $stateParams, Auth, $location, HandleErrors, AfterLogin ) {
  //model to store our join data
  $scope.loginModel = {};

  //called on submit of login form
  $scope.login = function() {
    var userData = {
      'user': {
        'email': $scope.loginModel.email,
        'password': $scope.loginModel.password
      }
    };

    //check if everything is valid
    if($scope.loginForm.$valid) {
      Auth.login(userData, onSuccess, onError);
    }
    
    function onSuccess(resp) {
      //if successfully jogged in check if we have anything in the to-do queue
      if(AfterLogin.callbacks()) {
        AfterLogin.executeCallbacks();
      } else {
        //or else send to their feed
        $location.path('/myfeed');
      }
    }

    function onError(resp) {
      HandleErrors.onError(resp, $scope.loginForm);
    }
  };
});