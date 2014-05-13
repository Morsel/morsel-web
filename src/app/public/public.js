angular.module( 'Morsel.public', [
  //libs
  'angularMoment',
  'angular-carousel',
  'restangular',
  'swipe',
  'ui.bootstrap',
  'ui.router',
  'ui.route',
  //filters
  'Morsel.common.reverse',
  //API
  'Morsel.common.apiFeed',
  'Morsel.common.apiItems',
  'Morsel.common.apiKeywords',
  'Morsel.common.apiMorsels',
  'Morsel.common.apiUploads',
  'Morsel.common.apiUsers',
  //templates
  'templates-public',
  //common
  'Morsel.common.afterLogin',
  'Morsel.common.auth',
  'Morsel.common.baseErrors',
  'Morsel.common.comments',
  'Morsel.common.cuisineUsers',
  'Morsel.common.follow',
  'Morsel.common.followedUsers',
  'Morsel.common.followers',
  'Morsel.common.formNameFix',
  'Morsel.common.handleErrors',
  'Morsel.common.itemActionBar',
  'Morsel.common.immersiveSwipe',
  'Morsel.common.mixpanel',
  'Morsel.common.morselSwipe',
  'Morsel.common.itemLike',
  'Morsel.common.photoHelpers',
  'Morsel.common.responsiveImages',
  'Morsel.common.socialSharing',
  'Morsel.common.specialtyUsers',
  'Morsel.common.submitBtn',
  'Morsel.common.textLimit',
  'Morsel.common.userImage',
  'Morsel.common.validatedElement',
  //app
  'Morsel.public.editProfile',
  'Morsel.public.home',
  'Morsel.public.morselDetail',
  'Morsel.public.profile'//:username in route clobbers other routes - this needs to be last until a better solution is found
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

.constant('MORSELPLACEHOLDER', '/assets/images/logos/morsel-placeholder.jpg')

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider, APIURL ) {
  var defaultRequestParams = {};

  $locationProvider.html5Mode(true).hashPrefix('!');

  //if we don't recognize the URL, send it to the homepage for now
  $urlRouterProvider.otherwise( '/' );

  //Restangular configuration
  RestangularProvider.setBaseUrl(APIURL);
  RestangularProvider.setRequestSuffix('.json');
  RestangularProvider.setResponseExtractor(function(response, operation, what, url) {
    // This is a get for a list
    var newResponse;
    if (operation === "get") {
      // Here we're returning our data object, with one special metadata property with extra information
      newResponse = response.data || {};
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
  var viewOptions = {
    miniHeader : false,
    hideFooter : false
  };

  Auth.setupInterceptor();
  Auth.resetAPIParams();

  resetViewOptions();

  setMinimumMainHeight();
  //also bind on resize
  angular.element($window).bind('resize', _.debounce(onBrowserResize, 300));

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
      $window.location.href = '/login';
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
    if(!$scope.viewOptions) {
      $scope.viewOptions = {};
    }

    _.extend($scope.viewOptions, viewOptions);
  }

  function setMinimumMainHeight() {
    //set the height of our main site to be at least as tall as the window
    $scope.viewOptions.minimumMainHeight = function(){
      return {'min-height': $window.innerHeight+'px'};
    };
  }

  function onBrowserResize() {
    setMinimumMainHeight();
    $scope.$apply('viewOptions');
  }

  $scope.goTo = function(path) {
    $location.path(path);
    $scope.menuOpen = false;
  };
});

