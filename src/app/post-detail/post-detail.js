angular.module( 'Morsel.postDetail', [
  'Morsel.morselSwipe'
])

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

.controller( 'PostDetailCtrl', function PostDetailCtrl( $scope, $stateParams, ApiPosts, $location ) {
  var postDetailsArr = $stateParams.postDetails.split('/'),
      postIdSlug = postDetailsArr[0],
      postMorselNumber = parseInt(postDetailsArr[1], 10);

  $scope.post = {};

  //check and make sure we pulled an idslug from the URL
  if(postIdSlug) {
    ApiPosts.getPost(postIdSlug).then(function(postData){
      if(isNaN(postMorselNumber) || postMorselNumber > postData.morsels.length) {
        $scope.postMorselNumber = 1;
      } else {
        $scope.postMorselNumber = postMorselNumber;
      }

      _.each(postData.morsels, function() {
      });

      $scope.post = postData;
    }, function() {

    });
  } else {
    //if not, send to profile page
    $location.path('/'+$scope.params.username);
  }
});