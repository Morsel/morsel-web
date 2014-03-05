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

  //fetch comments for the current morsel
  $scope.getComments = function(morselId) {
    var morsel;

    //make sure we have our post data
    if($scope.post) {
      morsel = filterMorselsById(morselId);

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

  $scope.addComment = function() {
    var commentScope = this;

    ApiMorsels.postComment(commentScope.morsel.id, commentScope.addCommentDescription).then(function(commentData){
      var morsel = filterMorselsById(commentData.morsel_id);

      if(morsel.comments) {
        morsel.comments.unshift(commentData);
      } else {
        morsel.comments = commentData;
      }
      //clear comment textarea
      commentScope.addCommentDescription = '';
    }, function() {
      console.log('error');
    });
  };

  function filterMorselsById(morselId) {
    return $scope.post.morsels.filter(function(m) {
      return m.id === morselId;
    })[0];
  }
});