angular.module( 'Morsel.login', [
  //libs
  'angularMoment',
  'restangular',
  'ui.bootstrap',
  'ui.router',
  'ui.route',
  //filters
  //API
  'Morsel.common.apiUsers',
  'Morsel.common.apiUploads',
  //templates
  'templates-login',
  //common
  'Morsel.common.afterLogin',
  'Morsel.common.auth',
  'Morsel.common.baseErrors',
  'Morsel.common.connectFacebook',
  'Morsel.common.connectTwitter',
  'Morsel.common.formNameFix',
  'Morsel.common.ga',
  'Morsel.common.handleErrors',
  'Morsel.common.imageUpload',
  'Morsel.common.mixpanel',
  'Morsel.common.photoHelpers',
  'Morsel.common.submitBtn',
  'Morsel.common.userImage',
  'Morsel.common.validatedElement',
  //app
  'Morsel.login.join',
  'Morsel.login.login',
  'Morsel.login.logout',
  'Morsel.login.passwordReset'
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

  //if we don't recognize the URL, send them to the login page for now
  $urlRouterProvider.otherwise( '/login' );

  //Restangular configuration
  RestangularProvider.setBaseUrl(APIURL);
  RestangularProvider.setRequestSuffix('.json');

  $stateProvider.state( '404', {
    url: '/404',
    views: {
      "main": {
        controller: function($scope){
        },
        templateUrl: 'common/util/404.tpl.html'
      }
    },
    data: {
      pageTitle: 'Page Not Found'
    }
  });
})

.run( function run ($window) {
  $window.moment.lang('en');
})

.controller( 'LoginAppCtrl', function LoginAppCtrl ( $scope, $location, Auth, $window, Mixpanel, $state, GA ) {
  var viewOptions = {
    miniHeader : false
  };

  Auth.setupInterceptor();
  Auth.resetAPIParams();

  resetViewOptions();

  setMinimumMainHeight();
  //also bind on resize
  angular.element($window).bind('resize', _.debounce(onBrowserResize, 300));

  //initial fetching of user data for header
  Auth.setInitialUserData().then(function(currentUser){
    $scope.currentUser = currentUser;

    //get and send some super properties to mixpanel
    if(Auth.isLoggedIn()) {
      //identify our users by their ID, also don't overwrite their id if they log out by wrapping in if
      Mixpanel.identify(currentUser.id);
    }

    Mixpanel.register({
      is_staff : Auth.isStaff()
    });
  }, function() {
    console.log('Trouble initiating user...');
  });

  if(MorselConfig.twitterData) {
    $location.path('/join');
  }

  //when a user starts to access a new route
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    //if non logged in user tries to access a restricted route
    if(toState.access && toState.access.restricted && !Auth.potentiallyLoggedIn()) {
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
    Auth.getCurrentUserPromise().then(function(userData){
      $scope.isLoggedIn = Auth.isLoggedIn();
      $scope.currentUser = userData;
    });

    //manually push a GA pageview
    GA.sendPageView($scope.pageTitle);
  });

  //if there are internal state issues, go to 404
  $scope.$on('$stateChangeError', function(e) {
    $state.go('404');
  });

  //to store user data as they're signing up/logging in
  $scope.userData = {
    social: {},
    registered: {}
  };

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

