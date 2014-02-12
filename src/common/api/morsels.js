angular.module( 'Morsel.apiMorsels', [] )

// ApiMorsels is the middleman for dealing with /morsels requests
.factory('ApiMorsels', function($http, Restangular, $q, ApiUploads) {
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

  Morsels.addMorsel = function(morselData, photo, onSuccess, onError, onProgress) {
    if(photo) {
      //use angular upload with photo
      ApiUploads.upload(morselData, photo, 'morsel[photo]', 'morsels', 'POST', onProgress).then(function(resp){
        onSuccess();
      }, function(resp){
        onError(resp);
      });
    } else {
      //no photo - use normal restangular post
      RestangularMorsels.post(angular.toJson(morselData)).then(function(resp){
        onSuccess();
      }, function(resp){
        onError(Restangular.stripRestangular(resp));
      });
    }
  };

  return Morsels;
});