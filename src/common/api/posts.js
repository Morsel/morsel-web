angular.module( 'Morsel.apiPosts', [] )

// ApiPosts is the middleman for dealing with /post requests
.factory('ApiPosts', function($http, Restangular) {
  var Posts = {},
      RestangularPosts = Restangular.all('posts');

  Posts.getPosts = function() {
    return RestangularPosts.getList().then(function(data) {
      return data;
    });
  };

  return Posts;
});