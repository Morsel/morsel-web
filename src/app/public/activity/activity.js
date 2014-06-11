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
    data:{ pageTitle: 'Your Activity' },
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

  ApiUsers.getActivities().then(function(activityResp){
    $scope.myActivityFeed = activityResp.data;
  });

  ApiUsers.getFollowablesActivities().then(function(activityResp){
    $scope.followingFeed = activityResp.data;
  });

  ApiUsers.getNotifications().then(function(notificationResp){
    var notificationsFeed = [];

    _.each(notificationResp.data, function(notification){
      notificationsFeed.push(notification.payload);
    });

    $scope.notificationsFeed = notificationsFeed;
  });
});