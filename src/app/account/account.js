angular.module( 'Morsel.account', [
  //libs
  'angularMoment',
  'pasvaz.bindonce',
  'restangular',
  'ui.bootstrap',
  'ui.router',
  'ui.route',
  //filters
  //API
  'Morsel.common.apiKeywords',
  'Morsel.common.apiUsers',
  'Morsel.common.apiUploads',
  //templates
  'templates-account',
  //common
  'Morsel.common.addFacebook',
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
  'Morsel.common.imageUpload',
  'Morsel.common.mixpanel',
  'Morsel.common.photoHelpers',
  'Morsel.common.rollbar',
  'Morsel.common.submitBtn',
  'Morsel.common.userImage',
  'Morsel.common.validatedElement',
  //app
  'Morsel.account.accountSettings',
  'Morsel.account.body',
  'Morsel.account.cuisinesSpecialties',
  'Morsel.account.editProfile',
  'Morsel.account.socialAccounts'
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

.constant('MORSELPLACEHOLDER', '/assets/images/utility/placeholders/morsel-placeholder_640x640.jpg')

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider, APIURL, $provide ) {
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
})

.run( function run ($window) {
  $window.moment.lang('en');
})

.controller( 'AccountCtrl', function AccountCtrl ( $scope, $location, Auth, $window, $document, Mixpanel, $state, GA, $modalStack ) {
  var viewOptions = {
    miniHeader : false
  };

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
  Auth.setInitialUserData().then(function(currentUser){
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
  }, function() {
    console.log('Trouble initiating user...');
  });

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
    
    resetViewOptions();
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

  $scope.menuGoTo = function(route) {
    $scope.closeMenu();
    $location.path('/'+route);
  };

  $scope.goToProfile = function() {
    if($scope.currentUser && $scope.currentUser.username) {
      $window.location.href= '/'+$scope.currentUser.username.toLowerCase();
    }
    $scope.closeMenu();
  };

  $scope.closeMenu = function() {
    $scope.menuOpen = false;
  };
});
