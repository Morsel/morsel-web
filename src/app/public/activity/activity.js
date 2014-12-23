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

.controller( 'ActivityCtrl', function ActivityCtrl( $scope, currentUser, ApiUsers, ACTIVITY_LIST_NUMBER ) {
  $scope.user = currentUser;

  $scope.getActivities = function() {
    var activitiesParams = {
          count: ACTIVITY_LIST_NUMBER
        };

    //get the next page number
    $scope.activitiesPageNumber = $scope.activitiesPageNumber ? $scope.activitiesPageNumber+1 : 1;
    activitiesParams.page = $scope.activitiesPageNumber;

    ApiUsers.getActivities(activitiesParams).then(function(activityResp){
      if($scope.myActivityFeed) {
        //concat them with new data after old data
        $scope.myActivityFeed = $scope.myActivityFeed.concat(activityResp.data);
      } else {
        $scope.myActivityFeed = activityResp.data;
      }
    });
  };
  
  $scope.getFollowablesActivities = function() {
    var followablesActivitiesParams = {
          count: ACTIVITY_LIST_NUMBER
        };

    //get the next page number
    $scope.followablesActivitiesPageNumber = $scope.followablesActivitiesPageNumber ? $scope.followablesActivitiesPageNumber+1 : 1;
    followablesActivitiesParams.page = $scope.followablesActivitiesPageNumber;

    ApiUsers.getFollowablesActivities(followablesActivitiesParams).then(function(followablesActivityResp){
      if($scope.followingFeed) {
        //concat them with new data after old data
        $scope.followingFeed = $scope.followingFeed.concat(followablesActivityResp.data);
      } else {
        $scope.followingFeed = followablesActivityResp.data;
      }
    });
  };
});