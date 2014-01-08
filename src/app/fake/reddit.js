angular.module( 'Morsel.reddit', [
  'infinite-scroll',
  'reddit'
  ])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'reddit', {
    url: '/reddit',
    views: {
      "main": {
        controller: 'RedditCtrl',
        templateUrl: 'fake/reddit.tpl.html'
      }
    },
    data:{ pageTitle: 'Reddit' }
  });
})

.controller( 'RedditCtrl', function RedditCtrl( $scope, $stateParams, Restangular, Reddit ) {
  var users = Restangular.one('users', 1);

  users.get().then(function(user) {
    $scope.user = user;
  });

  $scope.reddit = new Reddit();
});
