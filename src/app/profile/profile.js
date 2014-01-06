angular.module( 'Morsel.profile', [])

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

.controller( 'ProfileCtrl', function ProfileCtrl( $scope, $stateParams, Restangular ) {
  var posts = Restangular.one('posts', 1);

  posts.get().then(function(post) {
    $scope.post = post;
  });
});
