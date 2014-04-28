angular.module( 'Morsel.apiKeywords', [] )

// ApiWorss is the middleman for dealing with /cuisine and /specialties requests
.factory('ApiKeywords', function($http, Restangular, $q) {
  var Keywords = {};

  Keywords.getAllCuisines = function() {
    var deferred = $q.defer();
    
    Restangular.one('cuisines').get().then(function(resp){
      deferred.resolve(resp);
    }, function(resp) {
      deferred.reject(resp);
    });

    return deferred.promise;
  };

  return Keywords;
});