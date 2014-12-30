angular.module( 'Morsel.public.activity', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'activity', {
    url: '/activity',
    views: {
      "main": {
        controller: 'ActivityCtrl',
        templateUrl: 'app/public/activity/activity.tpl.html'
      }
    },
    data:{ pageTitle: 'Activity' },
    access: {
      restricted : true
    }, 
    resolve: {
      //get current user data before displaying
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'ActivityCtrl', function ActivityCtrl( $scope, currentUser, ApiUsers ) {
  $scope.user = currentUser;

  $scope.getActivities = function(params) {
    ApiUsers.getActivities(params).then(function(activityResp){
      if($scope.myActivityFeed) {
        //concat them with new data after old data
        $scope.myActivityFeed = $scope.myActivityFeed.concat(activityResp.data);
      } else {
        $scope.myActivityFeed = activityResp.data;
      }
    });
  };
  
  $scope.getFollowablesActivities = function(params) {
    ApiUsers.getFollowablesActivities(params).then(function(followablesActivityResp){
      if($scope.followingFeed) {
        //concat them with new data after old data
        $scope.followingFeed = $scope.followingFeed.concat(followablesActivityResp.data);
      } else {
        $scope.followingFeed = followablesActivityResp.data;
      }
    });
  };
});