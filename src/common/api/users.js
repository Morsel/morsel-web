angular.module( 'Morsel.apiUsers', [] )

// ApiUsers is the middleman for dealing with /users requests
.factory('ApiUsers', function($http, Restangular, $q) {
  var Users = {},
      RestangularUsers = Restangular.all('users');

  Users.getUser = function(username) {
    return RestangularUsers.get(username);
  };

  Users.getPosts = function(userId) {
    return Restangular.one('users', userId).one('posts').get();
  };

  Users.newUser = function(userData) {
    var deferred = $q.defer();

    RestangularUsers.post(angular.toJson(userData)).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.loginUser = function(userData) {
    var deferred = $q.defer();

    Restangular.one('users').post('sign_in', angular.toJson(userData)).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  //called on initial app load if we have user info in storage
  Users.getUserData = function(userId) {
    var deferred = $q.defer();

    //THIS METHOD WILL EVENTUALLY CHANGE...
    Restangular.one('users', userId).get().then(function(resp){
      deferred.resolve(resp);
    }, function(resp){
      deferred.reject(resp);
    });

    return deferred.promise;
  };

  return Users;
});