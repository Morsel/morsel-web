angular.module( 'Morsel.common.apiItems', [] )

// ApiItems is the middleman for dealing with /items requests
.factory('ApiItems', function($http, Restangular, $q, ApiUploads) {
  var Items = {},
      RestangularItems = Restangular.all('items');

  Items.getItem = function(itemId, presigned) {
    var deferred = $q.defer();

    RestangularItems.customGET(itemId, {
      prepare_presigned_upload: presigned || false
    }).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

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

  Items.getComments = function(itemId, commentParams) {
    var deferred = $q.defer();

    Restangular.one('items', itemId).one('comments', 1, true).get(commentParams).then(function(resp){
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

  Items.deleteComment = function(itemId, commentId) {
    var deferred = $q.defer();

    Restangular.one('items', itemId).one('comments', commentId).remove().then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Items.getLikers = function(itemId, usersParams) {
    var deferred = $q.defer();

    Restangular.one('items', itemId).one('likers', 1, true).get(usersParams).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Items.updateItem = function(itemId, itemParams) {
    var deferred = $q.defer();

    Restangular.one('items', itemId).customPUT(itemParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Items.createItem = function(itemParams) {
    var deferred = $q.defer();

    RestangularItems.post(itemParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Items;
});