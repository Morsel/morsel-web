angular.module( 'Morsel.apiUsers', [] )

// ApiUsers is the middleman for dealing with /users requests
.factory('ApiUsers', function($http, Restangular, $q) {
  var Users = {},
      RestangularUsers = Restangular.all('users');

  Users.getUser = function(userId) {
    return RestangularUsers.get(userId);
  };

  Users.getPosts = function(userId) {
    return Restangular.one('users', userId).one('posts').get();
  };

  Users.newUser = function(email, password, firstName, lastName, title) {
    var deferred = $q.defer();

    return RestangularUsers.post(angular.toJson({
      'user': {
        'email': email,
        'password': password,
        'first_name': firstName,
        'last_name': lastName,
        'title': title
      }
    })).then(function(resp){
      console.log(resp);
      deferred.resolve();
    }, function(resp){
      console.log(resp);
      deferred.reject();
    });
  };
  return Users;
});