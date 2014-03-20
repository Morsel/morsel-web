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

.controller( 'PostDetailCtrl', function PostDetailCtrl( $scope, $stateParams, ApiPosts, ApiMorsels, $location ) {
  var postDetailsArr = $stateParams.postDetails.split('/'),
      postIdSlug = postDetailsArr[0],
      postMorselNumber = parseInt(postDetailsArr[1], 10);

  $scope.swipeEvents = {
    needsComments: false
  };

  $scope.$watch('swipeEvents.needsComments', function(newMorselNum) {
    if(newMorselNum && $scope.post) {
      $scope.getComments($scope.post.morsels[newMorselNum].id);
    }
  });

  //create an array of all morsel swiping on the page. will house directive data
  $scope.morselSwipes = [];

  //check and make sure we pulled an idslug from the URL
  if(postIdSlug) {
    ApiPosts.getPost(postIdSlug).then(function(postData){
      if(isNaN(postMorselNumber) || postMorselNumber > postData.morsels.length) {
        $scope.postMorselNumber = 1;
      } else {
        $scope.postMorselNumber = postMorselNumber;
      }

      $scope.post = postData;

      //get comments for initial morsel
      $scope.getComments(postData.morsels[$scope.postMorselNumber - 1].id);
    }, function() {

    });
  } else {
    //if not, send to profile page
    $location.path('/'+$scope.params.username);
  }
});