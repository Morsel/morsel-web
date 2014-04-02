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

.controller( 'PostDetailCtrl', function PostDetailCtrl( $scope, $stateParams, ApiPosts, ApiUsers, $location, PageData ) {
  var username = $stateParams.username,
      postDetailsArr = $stateParams.postDetails.split('/'),
      postIdSlug = postDetailsArr[0],
      postMorselNumber = parseInt(postDetailsArr[1], 10);

  $scope.viewOptions.hideHeader = true;
  $scope.viewOptions.hideFooter = true;

  //scope vars for individual story
  $scope.immersiveState = {
    inStory : false
  };

  $scope.updateImmersiveState = function(obj) {
    _.extend($scope.immersiveState, obj);
    $scope.$digest();
  };

  //check and make sure we pulled an idslug from the URL
  if(postIdSlug && username) {
    ApiPosts.getPost(postIdSlug).then(function(postData){
      $scope.story = postData;

      PageData.setTitle($scope.story.title);
      PageData.setDescription('testing a description');
      $scope.htmlReady();
    }, function() {
      //if there's an error retrieving post data (bad id?), go to profile page for now
      $location.path('/'+$stateParams.username);
    });

    ApiUsers.getUser(username).then(function(userData){
      $scope.owner = userData;
    }, function() {
      //if there's an error retrieving post data (bad username?), go to home page for now
      $location.path('/');
    });
  } else {
    //if not, send to profile page
    $location.path('/'+$stateParams.username);
  }
});