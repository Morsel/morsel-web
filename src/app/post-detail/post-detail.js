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
    data:{ pageTitle: 'Post Detail' }
  });
})

.controller( 'PostDetailCtrl', function PostDetailCtrl( $scope, $stateParams, ApiPosts, ApiUsers, $location ) {
  var postDetailsArr = $stateParams.postDetails.split('/'),
      postIdSlug = postDetailsArr[0],
      postMorselNumber = parseInt(postDetailsArr[1], 10);

  $scope.viewOptions.hideHeader = true;
  $scope.viewOptions.hideFooter = true;

  //check and make sure we pulled an idslug from the URL
  if(postIdSlug) {
    ApiPosts.getPost(5).then(function(postData){
      if(isNaN(postMorselNumber) || postMorselNumber > postData.morsels.length) {
        $scope.postMorselNumber = 1;
      } else {
        $scope.postMorselNumber = postMorselNumber;
      }

      $scope.stories = [postData];
    });

    ApiUsers.getUser('jasonvincent').then(function(userData){
      $scope.owner = userData;
    });
  } else {
    //if not, send to profile page
    $location.path('/'+$scope.params.username);
  }
});