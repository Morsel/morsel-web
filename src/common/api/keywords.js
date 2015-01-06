angular.module( 'Morsel.common.apiKeywords', [] )

// ApiKeywords is the middleman for dealing with keyword methods
.factory('ApiKeywords', function($http, Restangular, $q) {
  var Keywords = {};

  Keywords.getHashtagMorsels = function(hashtag, morselsParams) {
    var deferred = $q.defer();

   Restangular.one('hashtags', hashtag).one('morsels').get(morselsParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Keywords.hashtagSearch = function(hashtagParams) {
    var deferred = $q.defer();

   Restangular.one('hashtags').one('search').get(hashtagParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Keywords;
});