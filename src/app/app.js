angular.module( 'Morsel', [
  //templates
  'templates-app',
  'templates-common',
  //app
  'Morsel.about',
  'Morsel.addMorsel',
  'Morsel.dashboard',
  'Morsel.feed',
  'Morsel.home',
  'Morsel.join',
  'Morsel.login',
  'Morsel.logout',
  'Morsel.morsel',
  'Morsel.myfeed',
  'Morsel.post',
  'Morsel.postDetail',
  'Morsel.profile',
  //common
  'Morsel.auth',
  'Morsel.bgImage',
  'Morsel.morselLike',
  'Morsel.userImage',
  //API
  'Morsel.apiMorsels',
  'Morsel.apiPosts',
  'Morsel.apiUploads',
  'Morsel.apiUsers',
  //libs
  'angularMoment',
  'restangular',
  'ui.state',
  'ui.route'
])

//define some constants for the app

//the URL to use for our API
.constant('APIURL', 'http://api-staging.eatmorsel.com')
//dev
//.constant('APIURL', 'http://barf')
//marty
//.constant('APIURL', 'http://192.168.48.102:3000/')

//for any API requests
.constant('DEVICEKEY', 'client[device]')
.constant('DEVICEVALUE', 'web')
.constant('VERSIONKEY', 'client[version]')
.constant('VERSIONVALUE', window.MorselConfig.version)

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, RestangularProvider, APIURL ) {
  var defaultRequestParams = {};

  //if we don't recognize the URL, send it to the homepage for now
  $urlRouterProvider.otherwise( '/home' );

  //Restangular configuration
  RestangularProvider.setBaseUrl(APIURL);
  RestangularProvider.setRequestSuffix('.json');
  RestangularProvider.setResponseExtractor(function(response, operation, what, url) {
    // This is a get for a list
    var newResponse;
    if (operation === "get") {
      // Here we're returning an Array which has one special property metadata with our extra information
      newResponse = response.data;
      newResponse.metadata = response.meta;
    } else {
      // This is an element
      newResponse = response.data;
    }
    return newResponse;
  });
})

.run( function run ($window) {
  $window.moment.lang('en');
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, Auth ) {
  Auth.setupInterceptor();
  Auth.resetAPIParams();

  //initial fetching of user data for header/footer
  Auth.setInitialUserData().then(function(){
    updateUserData();
  }, function() {
    console.log('Trouble initiating user...');
  });

  //when a user starts to access a new route
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    //if non logged in user tries to access a restricted route
    if(toState.access && toState.access.restricted && !Auth.isLoggedIn()) {
      event.preventDefault();
      //send them to the login page
      $location.path('/login');
    }
  });

  //when a user accesses a new route
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      //update the page title
      $scope.pageTitle = toState.data.pageTitle + ' | Morsel' ;
    }
    //refresh our user data
    $scope.isLoggedIn = Auth.isLoggedIn();
    updateUserData();
  });

  //refresh user data
  function updateUserData() {
    var currentUser = Auth.getCurrentUser();

    $scope.currentUsername = currentUser.username;
    $scope.currentUserId = currentUser.id;
    $scope.fullName = currentUser.first_name + ' ' + currentUser.last_name;
  }

  $scope.goTo = function(path) {
    $location.path(path);
    $scope.menuOpen = false;
  };
});

