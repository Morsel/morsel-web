angular.module( 'Morsel', [
  //templates
  'templates-app',
  'templates-common',
  //app
  'Morsel.about',
  'Morsel.addMorsel',
  'Morsel.dashboard',
  'Morsel.home',
  'Morsel.immersive',
  'Morsel.join',
  'Morsel.login',
  'Morsel.logout',
  'Morsel.myfeed',
  'Morsel.postDetail',
  'Morsel.pressKit',
  'Morsel.profile',//:username in route clobbers other routes - this needs to be last until a better solution is found
  //common
  'Morsel.afterLogin',
  'Morsel.auth',
  'Morsel.bgImage',
  'Morsel.comments',
  'Morsel.formNameFix',
  'Morsel.handleErrors',
  'Morsel.immersiveSwipe',
  'Morsel.morselLike',
  'Morsel.morselPressShare',
  'Morsel.pageData',
  'Morsel.responsiveImages',
  'Morsel.socialSharing',
  'Morsel.storySwipe',
  'Morsel.submitBtn',
  'Morsel.textLimit',
  'Morsel.userImage',
  'Morsel.validatedElement',
  //filters
  'Morsel.reverse',
  //API
  'Morsel.apiFeed',
  'Morsel.apiMorsels',
  'Morsel.apiPosts',
  'Morsel.apiUploads',
  'Morsel.apiUsers',
  //libs
  'angularMoment',
  'swipe',
  'restangular',
  'ui.bootstrap',
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

// Default queries
.value('presetMediaQueries', {
  'default':   'only screen and (min-width: 1px)',
  'screen-xs': 'only screen and (min-width: 480px)',
  'screen-sm': 'only screen and (min-width: 768px)',
  'screen-md': 'only screen and (min-width: 992px)',
  'screen-lg': 'only screen and (min-width: 1200px)'
})

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider, APIURL ) {
  var defaultRequestParams = {};

  $locationProvider.html5Mode(true);

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

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, Auth, PageData ) {
  Auth.setupInterceptor();
  Auth.resetAPIParams();

  resetViewOptions();

  $scope.pageData = PageData;

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
    resetViewOptions();
  });

  //when a user accesses a new route
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    PageData.reset();
    
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      //update the page title
      PageData.setTitle(toState.data.pageTitle + ' | Morsel');
    }
    //refresh our user data
    $scope.isLoggedIn = Auth.isLoggedIn();
    updateUserData();
  });

  //refresh user data
  function updateUserData() {
    $scope.currentUser = Auth.getCurrentUser();
  }

  //reset our view options
  function resetViewOptions() {
    $scope.viewOptions = {
      hideHeader : false,
      hideFooter : false
    };
  }

  $scope.goTo = function(path) {
    $location.path(path);
    $scope.menuOpen = false;
  };
});

