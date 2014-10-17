angular.module( 'Morsel.common.apiMorsels', [] )
.constant('MORSEL_TEMPLATE_DATA_URL', 'https://morsel.s3.amazonaws.com/morsel-templates/data/add-morsel-templates.json')

// ApiMorsels is the middleman for dealing with /morsels requests
.factory('ApiMorsels', function($http, Restangular, $q, MORSEL_TEMPLATE_DATA_URL) {
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
      deferred.resolve(Restangular.stripRestangular(resp).data);
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Morsels.getTemplates = function() {
    var deferred = $q.defer();

    Restangular.oneUrl('templates', MORSEL_TEMPLATE_DATA_URL).get().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp).data);
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

  Morsels.updateMorsel = function(morselId, morselParams) {
    var deferred = $q.defer();

    Restangular.one('morsels', morselId).customPUT(morselParams).then(function(resp) {
      deferred.resolve(sortMorselItems(resp));
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

  return Morsels;
});