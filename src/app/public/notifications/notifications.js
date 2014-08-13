angular.module( 'Morsel.public.notifications', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'notifications', {
    url: '/notifications',
    views: {
      "main": {
        controller: 'NotificationsCtrl',
        templateUrl: 'app/public/notifications/notifications.tpl.html'
      }
    },
    data:{ pageTitle: 'Notifications' },
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

.controller( 'NotificationsCtrl', function NotificationsCtrl( $scope, currentUser, ApiUsers ) {
  $scope.user = currentUser;

  ApiUsers.getNotifications().then(function(notificationResp){
    var notificationsFeed = [];

    _.each(notificationResp.data, function(notification){
      notificationsFeed.push(notification.payload);
    });

    $scope.notificationsFeed = notificationsFeed;
  });
});