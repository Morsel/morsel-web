angular.module( 'Morsel.common.apiKeywords', [] )

// ApiWorss is the middleman for dealing with /cuisine and /specialties requests
.factory('ApiKeywords', function($http, Restangular, $q) {
  var Keywords = {};

  Keywords.getAllCuisines = function() {
    var deferred = $q.defer();
    
    Restangular.one('cuisines').get().then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Keywords.getCuisineUsers = function(cuisineId) {
    var deferred = $q.defer();

    Restangular.one('cuisines', cuisineId).one('users').get().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Keywords.getSpecialtyUsers = function(specialtyId) {
    var deferred = $q.defer();

    Restangular.one('specialties', specialtyId).one('users').get().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Keywords;
});