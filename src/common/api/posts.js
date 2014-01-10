angular.module( 'Morsel.apiPosts', [] )

// ApiPosts is the middleman for dealing with /posts requests
.factory('ApiPosts', function($http, Restangular) {
  var Posts = {},
      RestangularPosts = Restangular.all('posts');

  Posts.getPosts = function() {
    return RestangularPosts.getList().$object;
  };

  Posts.getPost = function(postId) {
    return RestangularPosts.get(postId).$object;
  };

  return Posts;
});