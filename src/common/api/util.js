angular.module( 'Morsel.common.apiUtil', [] )

// ApiUtil is the middleman for dealing with utility requests not covered in other API modules
.factory('ApiUtil', function($http, Restangular, $q) {
  var Util = {};

  Util.contact = function(contactData) {
    var deferred = $q.defer();

    Restangular.all('contact').post(contactData).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Util;
});