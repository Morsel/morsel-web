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

.controller( 'LoginCtrl', function LoginCtrl( $scope, $stateParams, Auth, $location ) {
  //any errors to be displayed from server
  $scope.serverErrors = [];

  //called on submit of login form
  $scope.login = function() {
    var userData = {
      'user': {
        'email': $scope.email,
        'password': $scope.password
      }
    };

    $scope.serverErrors = [];

    Auth.login(userData, function() {
      //if successfully logged in, send to their feed
      $location.path('/myfeed');
    }, function(resp) {
      $scope.serverErrors = resp.data.errors;
    });
  };
});