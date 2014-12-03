angular.module( 'Morsel.common.apiKeywords', [] )

// ApiWorss is the middleman for dealing with /cuisine and /specialties requests
.factory('ApiKeywords', function($http, Restangular, $q) {
  var Keywords = {};

  Keywords.getAllCuisines = function() {
    var deferred = $q.defer();
    
    Restangular.one('cuisines').get().then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Keywords.getAllSpecialties = function() {
    var deferred = $q.defer();
    
    Restangular.one('specialties').get().then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Keywords.getCuisineUsers = function(cuisineId, usersParams) {
    var deferred = $q.defer();

    Restangular.one('cuisines', cuisineId).one('users').get(usersParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Keywords.getSpecialtyUsers = function(specialtyId, usersParams) {
    var deferred = $q.defer();

    Restangular.one('specialties', specialtyId).one('users').get(usersParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Keywords.createUserTag = function(userId, keywordId) {
    var deferred = $q.defer();

    Restangular.one('users', userId).post('tags', {
      tag: {
        keyword_id: keywordId
      }
    }).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Keywords.deleteUserTag = function(userId, tagId) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('tags', tagId).remove().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Keywords.getHashtagMorsels = function(hashtag, morselsParams) {
    var deferred = $q.defer();

   Restangular.one('hashtags', hashtag).one('morsels').get(morselsParams).then(function(resp) {
      //return resp.data to be consistent with View More functionality. might change eventually
      deferred.resolve(Restangular.stripRestangular(resp).data);
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Keywords;
});