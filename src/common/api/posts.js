angular.module( 'Morsel.apiPosts', [] )

// ApiPosts is the middleman for dealing with /posts requests
.factory('ApiPosts', function($http, Restangular, $q) {
  var Posts = {},
      RestangularPosts = Restangular.all('morsels');

  Posts.getFeed = function() {
    return Restangular.one('feed').get();
  };

  Posts.getPost = function(postId) {
    var deferred = $q.defer();

    RestangularPosts.get(postId).then(function(resp){
      var postData = Restangular.stripRestangular(resp);
      //correctly sort morsel items by sort order before we even deal with them
      postData.items = _.sortBy(postData.items, 'sort_order');
      deferred.resolve(postData);
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  /*Items.addMorsel = function(morselData) {
    var deferred = $q.defer(),
        fd,
        k;

    //if morsel has a photo, need to use a multi-part request
    if(morselData.morsel.photo) {
      //create a new formdata object to hold all our data
      fd = new FormData();

      //loop through our data and append to fd
      for(k in morselData.morsel) {
        if(morselData.morsel[k]) {
          fd.append('morsel['+k+']', morselData.morsel[k]);
        }
      }

      //use our restangular multi-part post
      ApiUploads.upload('morsels', fd).then(function(resp){
        deferred.resolve(resp);
      }, function(resp){
        deferred.reject(resp);
      });
    } else {
      //no photo - use normal restangular post
      RestangularItems.post(angular.toJson(morselData)).then(function(resp){
        deferred.resolve(Restangular.stripRestangular(resp));
      }, function(resp){
        deferred.reject(Restangular.stripRestangular(resp));
      });
    }

    return deferred.promise;
  };*/

  return Posts;
});