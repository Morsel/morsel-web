describe( 'ApiItems factory', function() {
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

  it( 'should contain an ApiItems factory', inject(function(ApiItems) {
    expect(ApiItems).not.toEqual(null);
  }));
});

