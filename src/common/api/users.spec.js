describe( 'ApiUsers factory', function() {
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

  beforeEach( module( 'Morsel.public' ) );

  it( 'should contain an ApiUsers factory', inject(function(ApiUsers) {
    expect(ApiUsers).not.toEqual(null);
  }));

  it( 'should contain a getUser function', inject(function(ApiUsers) {
    expect(ApiUsers.getUser).toBeDefined();
  }));

  it( 'should contain a newUser function', inject(function(ApiUsers) {
    expect(ApiUsers.newUser).toBeDefined();
  }));

  describe('function getUser', function() {
    beforeEach(inject(function (_$httpBackend_, APIURL) {
      httpBackend = _$httpBackend_;
      httpBackend.expectGET(APIURL+'/users/jasonvincent.json').respond('{"data":{}}');
    }));

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it( 'should return an object', inject(function(ApiUsers) {
      var resolvedValue;
      ApiUsers.getUser('jasonvincent').then(function (data) {
        resolvedValue = data;
      });
      httpBackend.flush();
      expect(sanitizeRestangularAll(resolvedValue)).toEqual(jasmine.any(Object));
    }));
  });

  describe('function newUser', function() {
    beforeEach(inject(function (_$httpBackend_, APIURL) {
      httpBackend = _$httpBackend_;
      httpBackend.expectPOST(APIURL+'/users.json').respond('{"data":{}}');
    }));

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it( 'should return an object', inject(function(ApiUsers) {
      var resolvedValue;
      ApiUsers.newUser({
        user: {
          'email': 'email@test.com',
          'password': 'testpassword',
          'first_name': 'testfirst',
          'last_name': 'testlast'
        }
      }, null, function(){}).then(function (data) {
        resolvedValue = data;
      });
      httpBackend.flush();
      expect(sanitizeRestangularAll(resolvedValue)).toEqual(jasmine.any(Object));
    }));
  });

});