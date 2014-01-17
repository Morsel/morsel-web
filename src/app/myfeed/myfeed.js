angular.module( 'Morsel.myfeed', [
  'ui.state'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'myfeed', {
    url: '/myfeed',
    views: {
      "main": {
        controller: 'MyFeedCtrl',
        templateUrl: 'myfeed/myfeed.tpl.html'
      }
    },
    data:{ pageTitle: 'My Feed' },
    access: {
      restricted : true
    },
    resolve: {
      loggedInUser : 'userData'
    }
  });
})

.controller( 'MyFeedCtrl', function MyFeedCtrl( $scope, ApiPosts, loggedInUser ) {
  $scope.posts = ApiPosts.getPosts().$object;
  $scope.welcomeUserName = loggedInUser.first_name;
});