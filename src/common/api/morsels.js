angular.module( 'Morsel.common.apiMorsels', [] )
.constant('MORSEL_TEMPLATE_DATA_URL', 'https://morsel.s3.amazonaws.com/morsel-templates/data/add-morsel-templates.json')

// ApiMorsels is the middleman for dealing with /morsels requests
.factory('ApiMorsels', function($http, Restangular, $q, MORSEL_TEMPLATE_DATA_URL,Auth) {
  var Morsels = {},
      RestangularMorsels = Restangular.all('morsels');

  function sortMorselItems(resp) {
    var morselData = Restangular.stripRestangular(resp).data;

    //correctly sort morsel items by sort order before we even deal with them
    morselData.items = _.sortBy(morselData.items, 'sort_order');

    return morselData;
  }

  Morsels.getFeed = function() {
    return Restangular.one('feed').get();
  };



  Morsels.getMorsel = function(morselId) {
    var deferred = $q.defer();

    RestangularMorsels.get(morselId).then(function(resp){
      deferred.resolve(sortMorselItems(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.getDrafts = function(draftsParams) {
    var deferred = $q.defer();

    RestangularMorsels.one('drafts').get(draftsParams).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.getTemplates = function() {
    var deferred = $q.defer();

    Restangular.oneUrl('templates', MORSEL_TEMPLATE_DATA_URL).get().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.publishMorsel = function(morselId, morselParams) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).post('publish', morselParams).then(function(resp){
      deferred.resolve(sortMorselItems(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };
  Morsels.checkPublish = function(morselId,userId) {
    var deferred = $q.defer();
    morselParams={};
    morselParams.userId = userId;
    Restangular.one('morsels', morselId).post('check_publish', morselParams).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

   Morsels.received_association_requests = function(userId) {
    var deferred = $q.defer();
    Restangular.one('users', userId).customGET('received_association_requests').then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };
  Morsels.updateMorsel = function(morselId, morselParams) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).customPUT(morselParams).then(function(resp) {
      deferred.resolve(sortMorselItems(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };
  Morsels.asscoiateMorselToUser = function(morselParams) {
    var deferred = $q.defer();
    RestangularMorsels.one('associate_morsel_to_user').customPOST(morselParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
     deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.deleteMorsel = function(morselId) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).remove().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.createMorsel = function(morselParams) {
    var deferred = $q.defer();

    RestangularMorsels.post(morselParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.getTaggedUsers = function(morselId, userParams) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).one('tagged_users').get(userParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.getEligibleTaggedUsers = function(morselId, userParams) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).one('eligible_tagged_users').get(userParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.tagUser = function(morselId, userId) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).one('tagged_users', userId).post().then(function(resp){
      deferred.resolve(true);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  Morsels.untagUser = function(morselId, userId) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).one('tagged_users', userId).remove().then(function(resp){
      deferred.resolve(false);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  Morsels.likeMorsel = function(morselId) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).one('like').post().then(function(resp){
      deferred.resolve(true);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  Morsels.unlikeMorsel = function(morselId) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).one('like').remove().then(function(resp){
      deferred.resolve(false);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  Morsels.getLikers = function(morselId, usersParams) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).one('likers', 1, true).get(usersParams).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.reportInappropriate = function(morselId) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).one('report').post().then(function(resp){
      deferred.resolve(true);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  Morsels.search = function(morselParams) {
    var deferred = $q.defer();

   RestangularMorsels.one('search').get(morselParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.addToCollection = function(morselId, collectionId) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).post('collect', {
      collection_id: collectionId
    }).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.removeFromCollection = function(morselId, collectionId) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).one('collect').remove({
      collection_id: collectionId
    }).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Morsels;
});
