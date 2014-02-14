angular.module( 'Morsel.apiPosts', [] )

// ApiPosts is the middleman for dealing with /posts requests
.factory('ApiPosts', function($http, Restangular) {
  var Posts = {},
      RestangularPosts = Restangular.all('posts');

  Posts.getPosts = function() {
    return RestangularPosts.getList();
  };

  Posts.getPost = function(postId) {
    return RestangularPosts.get(postId);
  };

  return Posts;
});