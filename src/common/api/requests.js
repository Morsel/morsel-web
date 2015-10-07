angular.module( 'Morsel.common.apiRequests', [] )

// ApiNotifications is the middleman for dealing with notification methods
.factory('ApiRequests', function($http, Restangular, $q) {
  var Requests = {};
  
  Requests.getAsscociatedUsers = function(userId) {
    var deferred = $q.defer();
    Restangular.one('users', userId).customGET('received_association_requests').then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

      return deferred.promise;
    };

  Requests.permitHost = function(userId,request_creator_id) {
      
      var deferred = $q.defer();

      Restangular.one('users', userId).one('allow_association_request').customPUT({association_request_params:{request_creator_id:request_creator_id}}).then(function(resp) {
        deferred.resolve(Restangular.stripRestangular(resp));
      }, function(resp) {
        deferred.reject(Restangular.stripRestangular(resp));
      });

      return deferred.promise;
  };



  return Requests;
});

