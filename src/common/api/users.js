angular.module( 'Morsel.apiUsers', [] )

// ApiUsers is the middleman for dealing with /users requests
.factory('ApiUsers', function($http, Restangular) {
  var Users = {},
      RestangularUsers = Restangular.all('users');

  Users.getUser = function(userId) {
    return RestangularUsers.get(userId);
  };

  Users.getPosts = function(userId) {
    return Restangular.one('users', userId).one('posts').get();
  };

  return Users;
});