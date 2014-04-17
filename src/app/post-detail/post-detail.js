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

.controller( 'PostDetailCtrl', function PostDetailCtrl( $scope, $stateParams, ApiMorsels, ApiUsers, $location, $modal, $window ) {
  var username = $stateParams.username,
      postDetailsArr = $stateParams.postDetails.split('/'),
      postIdSlug = postDetailsArr[0],
      postMorselNumber = parseInt(postDetailsArr[1], 10);

  $scope.viewOptions.hideHeader = true;
  $scope.viewOptions.hideFooter = true;

  $scope.goHome = function() {
    $window.open($location.protocol() + '://'+ $location.host(), '_self');
  };
  
  //scope vars for individual story
  $scope.immersiveState = {
    inStory : false,
    onShare : false
  };

  $scope.updateImmersiveState = function(obj) {
    _.extend($scope.immersiveState, obj);
    $scope.$digest();
  };

  //check and make sure we pulled an idslug from the URL
  if(postIdSlug && username) {
    ApiMorsels.getMorsel(postIdSlug).then(function(postData){
      $scope.story = postData;
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