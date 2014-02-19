angular.module( 'Morsel.apiPosts', [] )

// ApiPosts is the middleman for dealing with /posts requests
.factory('ApiPosts', function($http, Restangular, $q) {
  var Posts = {},
      RestangularPosts = Restangular.all('posts');

  Posts.getPosts = function() {
    return RestangularPosts.getList();
  };

  Posts.getPost = function(postId) {
    var deferred = $q.defer();

    RestangularPosts.get(postId).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Posts;
});