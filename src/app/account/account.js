angular.module( 'Morsel.account', [
  //libs
  'angularMoment',
  'duScroll',
  'LocalStorageModule',
  'pasvaz.bindonce',
  'restangular',
  'ui.bootstrap',
  'ui.router',
  'ui.route',
  //filters
  //API
  'Morsel.common.apiKeywords',
  'Morsel.common.apiPlaces',
  'Morsel.common.apiUsers',
  'Morsel.common.apiUploads',
  //templates
  'templates-account',
  //common
  'Morsel.common.addFacebook',
  'Morsel.common.addPlace',
  'Morsel.common.addTwitter',
  'Morsel.common.afterLogin',
  'Morsel.common.auth',
  'Morsel.common.baseErrors',
  'Morsel.common.checklist',
  'Morsel.common.cuisinesSpecialties',
  'Morsel.common.facebookApi',
  'Morsel.common.formNameFix',
  'Morsel.common.ga',
  'Morsel.common.handleErrors',
  'Morsel.common.headerScroll',
  'Morsel.common.imageUpload',
  'Morsel.common.mixpanel',
  'Morsel.common.photoHelpers',
  'Morsel.common.placeList',
  'Morsel.common.rollbar',
  'Morsel.common.submitBtn',
  'Morsel.common.userImage',
  'Morsel.common.usersName',
  'Morsel.common.validatedElement',
  //app
  'Morsel.account.accountSettings',
  'Morsel.account.body',
  'Morsel.account.cuisinesSpecialties',
  'Morsel.account.editProfile',
  'Morsel.account.places',
  'Morsel.account.socialAccounts'
])

//define some constants for the app

//the URL to use for our API
.constant('APIURL', window.MorselConfig.apiUrl || 'https://api-staging.eatmorsel.com')

//for any API requests
.constant('DEVICEKEY', 'client[device]')
.constant('DEVICEVALUE', 'web')
.constant('VERSIONKEY', 'client[version]')
.constant('VERSIONVALUE', window.MorselConfig.version)
.constant('USER_UPDATE_CHECK_TIME', 5000)

// Default queries
.value('presetMediaQueries', {
  'default':   'only screen and (min-width: 1px)',
  'screen-xs': 'only screen and (min-width: 480px)',
  'screen-sm': 'only screen and (min-width: 768px)',
  'screen-md': 'only screen and (min-width: 992px)',
  'screen-lg': 'only screen and (min-width: 1200px)'
})

.constant('MORSELPLACEHOLDER', '/assets/images/utility/placeholders/morsel-placeholder_640x640.jpg')

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider, APIURL, $provide, localStorageServiceProvider ) {
  var defaultRequestParams = {};

  $locationProvider.html5Mode(true).hashPrefix('!');

  //if we don't recognize the URL, send them to 404
  $urlRouterProvider.otherwise( '/404' );

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

  $provide.decorator('$exceptionHandler', ['$delegate', function ($delegate) {
    return function(exception, cause) {
      // Calls the original $exceptionHandler.
      $delegate(exception, cause);

      //submit to rollbar - can't use factory during config
      if(window.Rollbar) {
        Rollbar.error('Error: '+exception.message, exception);
      }
    };
  }]);

  localStorageServiceProvider.prefix = 'mrsl';
})

.run( function run ($window) {
  $window.moment.lang('en');
})

.controller( 'AccountCtrl', function AccountCtrl ( $scope, $location, Auth, $window, $document, Mixpanel, $state, GA, $modalStack, $timeout, USER_UPDATE_CHECK_TIME ) {
  var viewOptions = {},
      $body = angular.element(document.getElementsByTagName('body'));

  //to store things like page title
  $scope.pageData = {
    pageTitle: $document[0].title
  };

  Auth.setupInterceptor();
  Auth.resetAPIParams();

  resetViewOptions();

  setMinimumMainHeight();
  //also bind on resize
  angular.element($window).bind('resize', _.debounce(onBrowserResize, 300));

  //initial fetching of user data for header
  Auth.setInitialUserData().then(gotUserData, function() {
    console.log('Trouble initiating user...');
  });

  function gotUserData(currentUser) {
    $scope.currentUser = currentUser;
    $scope.isLoggedIn = Auth.isLoggedIn();
    $scope.isStaff = Auth.isStaff();
    
    //get and send some super properties to mixpanel
    if(Auth.isLoggedIn()) {
      //identify our users by their ID, also don't overwrite their id if they log out by wrapping in if
      Mixpanel.identify(currentUser.id);
    }

    Mixpanel.register({
      is_staff : Auth.isStaff()
    });

    //update user until we get their picture
    if($scope.currentUser.photo_processing) {
      $timeout(function() {
        Auth.updateUser().then(gotUserData);
      }, USER_UPDATE_CHECK_TIME);
    }
  }

  //when a user starts to access a new route
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    var currentLocation = $location.path(),
        nextPath,
        topModal = $modalStack.getTop();

    //if non logged in user tries to access a restricted route
    if(toState.access && toState.access.restricted && !Auth.potentiallyLoggedIn()) {
      event.preventDefault();

      //if the user is trying to get somewhere that's not able to be accessed until logging in, plug it into the URL as a query so they can be redirected after login
      nextPath = currentLocation ? '?next='+encodeURIComponent(currentLocation) : '';
      //send them to the login page
      $window.location.href ='/login' + nextPath;
    }

    //if there are any modals open, close them
    if (topModal) {
      $modalStack.dismiss(topModal.key);
    }
  });

  //when a user accesses a new route
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data && toState.data.pageTitle ) ) {
      //update the page title
      $scope.pageData.pageTitle = toState.data.pageTitle + ' | Morsel';
    }
    //refresh our user data
    Auth.getCurrentUserPromise().then(function(userData){
      $scope.isLoggedIn = Auth.isLoggedIn();
      $scope.currentUser = userData;
    });

    //manually push a GA pageview
    GA.sendPageview($scope.pageData.pageTitle);

    resetViewOptions();

    //make sure we're at the top of the page when we change routes
    $body.scrollTop(0, 0);
  });

  //if there are internal state issues, go to 404
  $scope.$on('$stateChangeError', function(e) {
    $state.go('404');
  });

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
});
