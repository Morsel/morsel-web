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

.controller( 'PostDetailCtrl', function PostDetailCtrl( $scope, $stateParams, ApiPosts, ApiMorsels, $location ) {
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

      $scope.post = postData;

      //get comments for initial morsel
      $scope.getComments(postData.morsels[$scope.postMorselNumber - 1].id);
    }, function() {

    });
  } else {
    //if not, send to profile page
    $location.path('/'+$scope.params.username);
  }

  //fetch comments for the current morsel
  $scope.getComments = function(morselId) {
    var morsel;

    //make sure we have our post data
    if($scope.post) {
      morsel = $scope.post.morsels.filter(function(m) {
        return m.id === morselId;
      })[0];

      //make sure we have a valid morsel
      if(morsel) {
        //if we don't have our comments cached already
        if(!morsel.comments) {
          ApiMorsels.getComments(morselId).then(function(commentData){
            morsel.comments = commentData;
          }, function() {
            console.log('error');
          });
        }
      }
    }
  };
});