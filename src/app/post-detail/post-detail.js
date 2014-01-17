angular.module( 'Morsel.postDetail', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'postDetail', {
    url: '/:username/{postDetails:.*}',
    views: {
      "main": {
        controller: 'PostDetailCtrl',
        templateUrl: 'post-detail/post-detail.tpl.html'
      }
    },
    data:{ pageTitle: 'Post Detail' },
    resolve: {
      loggedInUser : 'userData'
    }
  });
})

.controller( 'PostDetailCtrl', function PostDetailCtrl( $scope, $stateParams, ApiPosts, $location ) {
  var postDetailsArr = $stateParams.postDetails.split('/'),
      postId = postDetailsArr[0],
      postSlug = postDetailsArr[1],
      postMorselNumber = postDetailsArr[2];

  //check and make sure we pulled an id from the URL
  if(postId) {
    $scope.post = ApiPosts.getPost($stateParams.postId).$object;
  } else {
    //if not, send to profile page
    $location.path('/'+username);
  }
});