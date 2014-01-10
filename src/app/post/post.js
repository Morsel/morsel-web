angular.module( 'Morsel.post', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'post', {
    url: '/users/:userId/post/:postId',
    views: {
      "main": {
        controller: 'PostCtrl',
        templateUrl: 'post/post.tpl.html'
      }
    },
    data:{ pageTitle: 'Post' }
  });
})

.controller( 'PostCtrl', function ProfileCtrl( $scope, $stateParams, ApiPosts ) {
  $scope.post = ApiPosts.getPost($stateParams.postId);
});