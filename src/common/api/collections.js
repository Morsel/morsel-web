angular.module( 'Morsel.common.apiCollections', [] )

// ApiCollections is the middleman for dealing with /collections requests
.factory('ApiCollections', function($http, Restangular, $q) {
  var Collections = {},
      RestangularCollections = Restangular.all('collections');

  Collections.createCollection = function(collectionParams) {
    var deferred = $q.defer();

    RestangularCollections.post(collectionParams).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Collections.getCollection = function(collectionId) {
    var deferred = $q.defer();

    RestangularCollections.get(collectionId).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Collections.getCollectionMorsels = function(collectionId, collectionMorselsParams) {
    var deferred = $q.defer();

    Restangular.one('collections', collectionId).one('morsels').get(collectionMorselsParams).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Collections;
});