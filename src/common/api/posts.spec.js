describe( 'ApiPosts factory', function() {
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

  it( 'should contain an ApiPosts factory', inject(function(ApiPosts) {
    expect(ApiPosts).not.toEqual(null);
  }));

  it( 'should contain a getPosts function', inject(function(ApiPosts) {
    expect(ApiPosts.getPosts).toBeDefined();
  }));

  it( 'should contain a getPost function', inject(function(ApiPosts) {
    expect(ApiPosts.getPost).toBeDefined();
  }));

  describe('function getPosts', function() {
    beforeEach(inject(function (_$httpBackend_, APIURL) {
      httpBackend = _$httpBackend_;
      httpBackend.expectGET(APIURL+'/posts.json').respond('[{"name":"tester"},{"name":"tester2"}]');
    }));

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it( 'should return an object', inject(function(ApiPosts) {
      var resolvedValue;
      ApiPosts.getPosts().then(function (data) {
        resolvedValue = data;
      });
      httpBackend.flush();
      expect(sanitizeRestangularAll(resolvedValue)).toEqual(jasmine.any(Object));
    }));
  });

  describe('function getPost', function() {
    beforeEach(inject(function (_$httpBackend_, APIURL) {
      httpBackend = _$httpBackend_;
      httpBackend.expectGET(APIURL+'/posts/1.json').respond('[{"name":"tester"}]');
    }));

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it( 'should return an object', inject(function(ApiPosts) {
      var resolvedValue;
      ApiPosts.getPost(1).then(function (data) {
        resolvedValue = data;
      });
      httpBackend.flush();
      expect(sanitizeRestangularAll(resolvedValue)).toEqual(jasmine.any(Object));
    }));
  });
});

