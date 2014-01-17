describe( 'ApiMorsels factory', function() {
  var httpBackend;

  // Utils
  // Apply "sanitizeRestangularOne" function to an array of items
  function sanitizeRestangularAll(items) {
    var all = _.map(items, function (item) {
      return sanitizeRestangularOne(item);
    });
    return sanitizeRestangularOne(all);
  }

  // Remove all Restangular/AngularJS added methods in order to use Jasmine toEqual between the retrieve resource and the model
  function sanitizeRestangularOne(item) {
    return _.omit(item, "route", "parentResource", "getList", "get", "post", "put", "remove", "head", "trace", "options", "patch", "$get", "$save", "$query", "$remove", "$delete", "$put", "$post", "$head", "$trace", "$options", "$patch", "$then", "$resolved", "restangularCollection", "customOperation", "customGET", "customPOST", "customPUT", "customDELETE", "customGETLIST", "$getList", "$resolved", "restangularCollection", "one", "all", "doGET", "doPOST", "doPUT", "doDELETE", "doGETLIST", "addRestangularMethod", "getRestangularUrl");
  }

  beforeEach( module( 'Morsel' ) );

  it( 'should contain an ApiMorsels factory', inject(function(ApiMorsels) {
    expect(ApiMorsels).not.toEqual(null);
  }));

  it( 'should contain a likeMorsel function', inject(function(ApiMorsels) {
    expect(ApiMorsels.likeMorsel).toBeDefined();
  }));

  it( 'should contain an unlikeMorsel function', inject(function(ApiMorsels) {
    expect(ApiMorsels.unlikeMorsel).toBeDefined();
  }));

  describe('function likeMorsel', function() {
    beforeEach(inject(function (_$httpBackend_, APIURL) {
      httpBackend = _$httpBackend_;
      httpBackend.expectPOST(APIURL+'/morsels/1/like.json').respond('OK');
    }));

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it( 'should return a blank object', inject(function(ApiMorsels) {
      var resolvedValue;
      ApiMorsels.likeMorsel(1).then(function (data) {
        resolvedValue = data;
      });
      httpBackend.flush();
      expect(sanitizeRestangularAll(resolvedValue)).toEqual({});
    }));
  });

  describe('function unlikeMorsel', function() {
    beforeEach(inject(function (_$httpBackend_, APIURL) {
      httpBackend = _$httpBackend_;
      httpBackend.expectDELETE(APIURL+'/morsels/1/like.json').respond('OK');
    }));

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it( 'should return a blank object', inject(function(ApiMorsels) {
      var resolvedValue;
      ApiMorsels.unlikeMorsel(1).then(function (data) {
        resolvedValue = data;
      });
      httpBackend.flush();
      expect(sanitizeRestangularAll(resolvedValue)).toEqual({});
    }));
  });
});

