angular.module( 'Morsel', [
  //libs
  'angularMoment',
  'restangular',
  'swipe',
  'ui.bootstrap',
  'ui.state',
  'ui.route',
  //filters
  'Morsel.reverse',
  //API
  'Morsel.apiFeed',
  'Morsel.apiItems',
  'Morsel.apiMorsels',
  'Morsel.apiUploads',
  'Morsel.apiUsers',
  //templates
  'templates-app',
  'templates-common',
  //common
  'Morsel.afterLogin',
  'Morsel.auth',
  'Morsel.baseErrors',
  'Morsel.comments',
  'Morsel.formNameFix',
  'Morsel.handleErrors',
  'Morsel.itemActionBar',
  'Morsel.immersiveSwipe',
  'Morsel.mixpanel',
  'Morsel.morselSwipe',
  'Morsel.itemLike',
  'Morsel.responsiveImages',
  'Morsel.socialSharing',
  'Morsel.submitBtn',
  'Morsel.textLimit',
  'Morsel.userImage',
  'Morsel.validatedElement',
  //app
  'Morsel.about',
  'Morsel.addMorsel',
  'Morsel.home',
  'Morsel.join',
  'Morsel.login',
  'Morsel.logout',
  'Morsel.morselDetail',
  'Morsel.myfeed',
  'Morsel.profile'//:username in route clobbers other routes - this needs to be last until a better solution is found
])

//define some constants for the app

//the URL to use for our API
.constant('APIURL', window.MorselConfig.apiUrl || 'http://api-staging.eatmorsel.com')

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

  $locationProvider.html5Mode(true).hashPrefix('!');

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

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, Auth, $window, Mixpanel ) {
  Auth.setupInterceptor();
  Auth.resetAPIParams();

  resetViewOptions();

  //initial fetching of user data for header/footer
  Auth.setInitialUserData().then(function(){
    updateUserData();

    //get and send some super properties to mixpanel
    if(Auth.hasCurrentUser()) {
      //identify our users by their ID, also don't overwrite their id if they log out
      Mixpanel.identify(Auth.getCurrentUser()['id']);
    }

    Mixpanel.register({
      is_staff : Auth.isStaff()
    });
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
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      //update the page title
      $scope.pageTitle = toState.data.pageTitle + ' | Morsel';
    }
    //refresh our user data
    $scope.isLoggedIn = Auth.isLoggedIn();
    updateUserData();

    //manually push a GA pageview
    if($window._gaq) {
      $window._gaq.push(['_trackPageview', $location.path()]);
    }
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

