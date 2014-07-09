angular.module( 'Morsel.common.apiPlaces', [] )

// ApiPlaces is the middleman for dealing with /places requests
.factory('ApiPlaces', function($http, Restangular, $q) {
  var Places = {},
      RestangularPlaces = Restangular.all('places');

  Places.getPlace = function(idSlug) {
    var deferred = $q.defer();

    RestangularPlaces.get(idSlug).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Places;
});