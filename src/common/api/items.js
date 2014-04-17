angular.module( 'Morsel.apiItems', [] )

// ApiItems is the middleman for dealing with /items requests
.factory('apiItems', function($http, Restangular, $q, ApiUploads) {
  var Items = {},
      RestangularItems = Restangular.all('items');

  Items.likeItem = function(itemId) {
    var deferred = $q.defer();
    
    Restangular.one('items', itemId).one('like').post().then(function(resp){
      deferred.resolve(true);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  Items.unlikeItem = function(itemId) {
    var deferred = $q.defer();

    Restangular.one('items', itemId).one('like').remove().then(function(resp){
      deferred.resolve(false);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  Items.getComments = function(itemId) {
    var deferred = $q.defer();

    Restangular.one('items', itemId).getList('comments').then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Items.postComment = function(itemId, comment) {
    var deferred = $q.defer();

    Restangular.one('items', itemId).post('comments', {
      comment: {
        description: comment
      }
    }).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Items;
});