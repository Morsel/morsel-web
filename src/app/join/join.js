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

.controller( 'JoinCtrl', function JoinCtrl( $scope, $stateParams, ApiUsers ) {
  $scope.joinMorsel = function() {
    ApiUsers.newUser($scope.email, $scope.password, $scope.first_name, $scope.last_name, $scope.title).then(function() {
      console.log('congrats, new user');
    }, function() {
      console.log('denied');
    });
  };
});