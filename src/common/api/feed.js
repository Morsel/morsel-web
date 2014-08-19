angular.module( 'Morsel.common.apiFeed', [] )

// ApiFeed is the middleman for dealing with /feed requests
.factory('ApiFeed', function($http, Restangular, $q) {
  var Feed = {};

  Feed.getFeed = function(feedParams) {
    var deferred = $q.defer();

    Restangular.one('feed').get(feedParams).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Feed.getAllFeed = function(feedParams) {
    var deferred = $q.defer();

    Restangular.one('feed_all').get(feedParams).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Feed;
});