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

  it( 'should contain a getFeed function', inject(function(ApiMorsels) {
    expect(ApiMorsels.getFeed).toBeDefined();
  }));

  it( 'should contain a getMorsel function', inject(function(ApiMorsels) {
    expect(ApiMorsels.getMorsel).toBeDefined();
  }));

  describe('function getFeed', function() {
    beforeEach(inject(function (_$httpBackend_, APIURL) {
      httpBackend = _$httpBackend_;
      httpBackend.expectGET(APIURL+'/feed.json').respond('{"data":[]}');
    }));

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it( 'should return an object', inject(function(ApiMorsels) {
      var resolvedValue;
      ApiMorsels.getFeed().then(function (data) {
        resolvedValue = data;
      });
      httpBackend.flush();
      expect(sanitizeRestangularAll(resolvedValue)).toEqual(jasmine.any(Object));
    }));
  });

  describe('function getMorsel', function() {
    beforeEach(inject(function (_$httpBackend_, APIURL) {
      httpBackend = _$httpBackend_;
      httpBackend.expectGET(APIURL+'/morsels/1.json').respond('{"data":{}}');
    }));

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it( 'should return an object', inject(function(ApiMorsels) {
      var resolvedValue;
      ApiMorsels.getMorsel(1).then(function (data) {
        resolvedValue = data;
      });
      httpBackend.flush();
      expect(sanitizeRestangularAll(resolvedValue)).toEqual(jasmine.any(Object));
    }));
  });
});

