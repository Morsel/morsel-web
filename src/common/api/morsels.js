angular.module( 'Morsel.common.apiMorsels', [] )
.constant('MORSEL_TEMPLATE_DATA_URL', 'https://s3.amazonaws.com/morsel/morsel-templates/data/add-morsel-templates.json')

// ApiMorsels is the middleman for dealing with /morsels requests
.factory('ApiMorsels', function($http, Restangular, $q, MORSEL_TEMPLATE_DATA_URL) {
  var Morsels = {},
      RestangularMorsels = Restangular.all('morsels');

  Morsels.getFeed = function() {
    return Restangular.one('feed').get();
  };

  Morsels.getMorsel = function(morselId) {
    var deferred = $q.defer();

    RestangularMorsels.get(morselId).then(function(resp){
      var morselData = Restangular.stripRestangular(resp).data;
      //correctly sort morsel items by sort order before we even deal with them
      morselData.items = _.sortBy(morselData.items, 'sort_order');
      deferred.resolve(morselData);
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

    $http({method: 'GET', url: MORSEL_TEMPLATE_DATA_URL}).success(function(resp) {
      deferred.resolve(resp.data);
    }).error(function(resp) {
      deferred.reject(resp);
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

  return Morsels;
});