angular.module( 'Morsel.apiUsers', [] )

// ApiUsers is the middleman for dealing with /users requests
.factory('ApiUsers', function($http, Restangular, $q, ApiUploads) {
  var Users = {},
      RestangularUsers = Restangular.all('users');

  Users.getUser = function(username) {
    return RestangularUsers.get(username);
  };

  Users.newUser = function(userData) {
    var deferred = $q.defer(),
        fd,
        k;

    //if user has a photo, need to use a multi-part request
    if(userData.user.photo) {
      //create a new formdata object to hold all our data
      fd = new FormData();

      //loop through our data and append to fd
      for(k in userData.user) {
        if(userData.user[k]) {
          fd.append('user['+k+']', userData.user[k]);
        }
      }

      //use our restangular multi-part post
      ApiUploads.upload('users', fd).then(function(resp){
        deferred.resolve(resp);
      }, function(resp){
        deferred.reject(resp);
      });
    } else {
      //no photo - use normal restangular post
      RestangularUsers.post(angular.toJson(userData)).then(function(resp){
        deferred.resolve(Restangular.stripRestangular(resp));
      }, function(resp){
        deferred.reject(Restangular.stripRestangular(resp));
      });
    }

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
  Users.getMyData = function(userId) {
    var deferred = $q.defer();

    RestangularUsers.get('me').then(function(resp){
      deferred.resolve(resp);
    }, function(resp){
      deferred.reject(resp);
    });

    return deferred.promise;
  };

  Users.getMorsels = function(username) {
    return Restangular.one('users', username).one('morsels').get();
  };

  return Users;
});