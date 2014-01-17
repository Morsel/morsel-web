angular.module( 'Morsel.join', [
  'Morsel.match'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'join', {
    url: '/join',
    views: {
      "main": {
        controller: 'JoinCtrl',
        templateUrl: 'join/join.tpl.html'
      }
    },
    data:{ pageTitle: 'Join' }
  });
})

.controller( 'JoinCtrl', function JoinCtrl( $scope, $stateParams, Auth ) {
  $scope.serverErrors = [];

  $scope.join = function() {
    var userData = {
      'user': {
        'email': $scope.email,
        'password': $scope.password,
        'first_name': $scope.first_name,
        'last_name': $scope.last_name,
        'title': $scope.title
      }
    };

    $scope.serverErrors = [];

    Auth.join(userData, function() {
      console.log('welcome '+Auth.currentUser.first_name);
      //$location.path('/thanks');
    }, function(resp) {
      $scope.serverErrors = resp.data.errors;
    });
  };
});