angular.module( 'Morsel.userData', [] )

//a service to return a promise for data about a user
.service('userData', function($q, Auth) {
  var deferred = $q.defer();

  Auth.getUserData().then(function(userData){
    deferred.resolve(userData);
  });

  return deferred.promise;
});