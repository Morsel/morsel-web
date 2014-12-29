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

.controller( 'NotificationsCtrl', function NotificationsCtrl( $scope, currentUser, ApiNotifications, ACTIVITY_LIST_NUMBER, Mixpanel ) {
  $scope.user = currentUser;
  $scope.ACTIVITY_LIST_NUMBER = ACTIVITY_LIST_NUMBER;

  $scope.loadNotifications = function() {
    var notificationsParams = {
          count: $scope.ACTIVITY_LIST_NUMBER
        };

    //get the next page number
    $scope.notificationsPageNumber = $scope.notificationsPageNumber ? $scope.notificationsPageNumber+1 : 1;
    notificationsParams.page = $scope.notificationsPageNumber;

    ApiNotifications.getNotifications(notificationsParams).then(function(notificationResp){
      if($scope.notificationsFeed) {
        //concat them with new data after old data
        $scope.notificationsFeed = $scope.notificationsFeed.concat(notificationResp.data);
      } else {
        $scope.notificationsFeed = notificationResp.data;
      }
    });
  };
  
  $scope.loadNotifications();

  $scope.markRead = function(notification) {
    if(!notification.marked_read_at) {
      ApiNotifications.markNotificationRead(notification.id).then(function(resp){
        //set this to something to display in UI
        notification.marked_read_at = true;

        Mixpanel.track('Marked notification read', {
          unread_notification_count: $scope.notifications.count
        });

        //subtract one from our count in the header
        $scope.notifications.count--;
      });
    }
  };

  $scope.markAllRead = function() {
    var latestNotification = _.max($scope.notificationsFeed, function(n) {
          return n.id;
        });

    ApiNotifications.markAllNotificationsRead(latestNotification.id).then(function(resp){
      //set this to something to display in UI
      _.each($scope.notificationsFeed, function(n) {
        n.marked_read_at = true;
      });

      Mixpanel.track('Marked all notifications read', {
        unread_notification_count: $scope.notifications.count
      });

      //remove our count in the header
      $scope.notifications.count = 0;
    });
  };

  $scope.hasUnreadNotifications = function() {
    return _.find($scope.notificationsFeed, function(n) {
      return !n.marked_read_at;
    });
  };
});