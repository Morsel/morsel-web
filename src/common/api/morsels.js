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

  Morsels.addMorsel = function(morselData) {
    var deferred = $q.defer(),
        fd,
        k;

    //if morsel has a photo, need to use a multi-part request
    if(morselData.morsel.photo) {
      //create a new formdata object to hold all our data
      fd = new FormData();

      //loop through our data and append to fd
      for(k in morselData.morsel) {
        if(morselData.morsel[k]) {
          fd.append('morsel['+k+']', morselData.morsel[k]);
        }
      }

      //use our restangular multi-part post
      ApiUploads.upload('morsels', fd).then(function(resp){
        deferred.resolve(resp);
      }, function(resp){
        deferred.reject(resp);
      });
    } else {
      //no photo - use normal restangular post
      RestangularMorsels.post(angular.toJson(morselData)).then(function(resp){
        deferred.resolve(Restangular.stripRestangular(resp));
      }, function(resp){
        deferred.reject(Restangular.stripRestangular(resp));
      });
    }

    return deferred.promise;
  };

  Morsels.getComments = function(morselId) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).getList('comments').then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Morsels;
});