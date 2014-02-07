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

.controller( 'JoinCtrl', function JoinCtrl( $scope, $stateParams, Auth, $location ) {
  //any errors to be displayed from server
  $scope.serverErrors = [];

  //called on submit of join form
  $scope.join = function() {
    var userData = {
      'user': {
        'email': $scope.email,
        'username': $scope.username,
        'password': $scope.password,
        'first_name': $scope.first_name,
        'last_name': $scope.last_name,
        'title': $scope.title,
        'bio': $scope.bio
      }
    };

    $scope.serverErrors = [];

    Auth.join(userData, function() {
      //if successfully joined, send to their feed
      $location.path('/myfeed');
    }, function(resp) {
      $scope.serverErrors = resp.data.errors;
    });
  };
});