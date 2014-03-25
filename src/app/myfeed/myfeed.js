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
      hasCurrentUser : function(Auth) {
        return Auth.hasCurrentUser();
      }
    }
  });
})

.controller( 'MyFeedCtrl', function MyFeedCtrl( $scope, ApiPosts, Auth) {
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

  ApiPosts.getFeed().then(function(feedData){
    $scope.stories = feedData;
  });
});