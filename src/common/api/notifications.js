angular.module( 'Morsel.common.apiNotifications', [] )

// ApiNotifications is the middleman for dealing with notification methods
.factory('ApiNotifications', function($http, Restangular, $q) {
  var Notifications = {};

  Notifications.getNotifications = function(notificationsParams) {
    var deferred = $q.defer();

   Restangular.one('notifications').get(notificationsParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Notifications.getNotificationUnreadCount = function() {
    var deferred = $q.defer();

   Restangular.one('notifications').one('unread_count').get().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Notifications.markNotificationRead = function(notificationId) {
    var deferred = $q.defer();

   Restangular.one('notifications', notificationId).one('mark_read').customPUT().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Notifications.markAllNotificationsRead = function(maxId) {
    var deferred = $q.defer();

   Restangular.one('notifications').one('mark_read').customPUT({
    max_id: maxId
   }).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Notifications;
});