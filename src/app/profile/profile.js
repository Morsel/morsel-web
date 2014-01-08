angular.module( 'Morsel.profile', [
  'infinite-scroll',
  'reddit'
  ])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'profile', {
    url: '/profile/:username',
    views: {
      "main": {
        controller: 'ProfileCtrl',
        templateUrl: 'profile/profile.tpl.html'
      }
    },
    data:{ pageTitle: 'Profile' }
  });
})

.controller( 'ProfileCtrl', function ProfileCtrl( $scope, $stateParams, Restangular, Reddit ) {
  var users = Restangular.one('users', 1);

  users.get().then(function(user) {
    $scope.user = user;
  });

  $scope.reddit = new Reddit();
});
