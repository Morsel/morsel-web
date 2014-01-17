angular.module( 'Morsel.apiMorsels', [] )

// ApiMorsels is the middleman for dealing with /morsels requests
.factory('ApiMorsels', function($http, Restangular, $q) {
  var Morsels = {},
      RestangularMorsels = Restangular.all('morsels');

  Morsels.likeMorsel = function(morselId) {
    var deferred = $q.defer();
    
    Restangular.one('morsels', morselId).one('like').post().then(function(resp){
      deferred.resolve(true);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  Morsels.unlikeMorsel = function(morselId) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).one('like').remove().then(function(resp){
      deferred.resolve(false);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  return Morsels;
});