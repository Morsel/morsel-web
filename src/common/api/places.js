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

  Places.getMorsels = function(id) {
    var deferred = $q.defer();

    Restangular.one('places', id).one('morsels').get().then(function(resp) {
      var morselsData = Restangular.stripRestangular(resp).data;
      //correctly sort morsels by published_at before we even deal with them
      morselsData = _.sortBy(morselsData, 'published_at');
      deferred.resolve(morselsData);
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Places.getUsers = function(id) {
    var deferred = $q.defer();

    Restangular.one('places', id).one('users').get().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Places.followPlace = function(id) {
    var deferred = $q.defer();

    Restangular.one('places', id).one('follow').post().then(function(resp){
      deferred.resolve(true);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  Places.unfollowPlace = function(id) {
    var deferred = $q.defer();

    Restangular.one('places', id).one('follow').remove().then(function(resp){
      deferred.resolve(true);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  return Places;
});