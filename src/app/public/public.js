angular.module( 'Morsel.public', [
  //libs
  'angularMoment',
  'ct.ui.router.extras',
  'duScroll',
  'LocalStorageModule',
  'ngSanitize',
  'pasvaz.bindonce',
  'restangular',
  'ui.bootstrap',
  'ui.router',
  'ui.route',
  //filters
  'Morsel.common.reverse',
  'Morsel.common.nameMatch',
  //API
  'Morsel.common.apiCollections',
  'Morsel.common.apiFeed',
  'Morsel.common.apiItems',
  'Morsel.common.apiKeywords',
  'Morsel.common.apiMorsels',
  'Morsel.common.apiNotifications',
  'Morsel.common.apiRequests',
  'Morsel.common.apiPlaces',
  'Morsel.common.apiUploads',
  'Morsel.common.apiUsers',
  'Morsel.common.apiUtil',
  //templates
  'templates-public',
  //common
  'Morsel.common.activity',
  'Morsel.common.activityFeed',
  'Morsel.common.afterLogin',
  'Morsel.common.auth',
  'Morsel.common.baseErrors',
  'Morsel.common.comments',
  'Morsel.common.facebookApi',
  'Morsel.common.focusMe',
  'Morsel.common.follow',
  'Morsel.common.followedUsers',
  'Morsel.common.followers',
  'Morsel.common.formNameFix',
  'Morsel.common.ga',
  'Morsel.common.handleErrors',
  'Morsel.common.headerScroll',
  'Morsel.common.itemActionBar',
  'Morsel.common.iTunesLink',
  'Morsel.common.likeableFeed',
  'Morsel.common.mixpanel',
  'Morsel.common.morsel',
  'Morsel.common.morselActions',
  'Morsel.common.morselBlock',
  'Morsel.common.morselGrid',
  'Morsel.common.morselLike',
  'Morsel.common.morselSummary',
  'Morsel.common.morselTaggedUserList',
  'Morsel.common.parseUserText',
  'Morsel.common.photoHelpers',
  'Morsel.common.placeList',
  'Morsel.common.responsiveImages',
  'Morsel.common.rollbar',
  'Morsel.common.socialSharing',
  'Morsel.common.submitBtn',
  'Morsel.common.truncate',
  'Morsel.common.userImage',
  'Morsel.common.userList',
  'Morsel.common.usersName',
  'Morsel.common.validatedElement',
  'Morsel.common.viewMore',
  //app
  'Morsel.public.activity',
  'Morsel.public.collections.addToCollection',
  'Morsel.public.collections.collectionBlock',
  'Morsel.public.collections.collectionDetail',
  'Morsel.public.collections.editCollection',
  'Morsel.public.collections.newCollection',
  'Morsel.public.contact',
  'Morsel.public.eventMorsels',
  'Morsel.public.explore',
  'Morsel.public.explore.morsels',
  'Morsel.public.explore.morsels.matchingHashtags',
  'Morsel.public.explore.morsels.searchResults',
  'Morsel.public.explore.searchBar',
  'Morsel.public.explore.suggestedUsers',
  'Morsel.public.explore.users',
  'Morsel.public.feed',
  'Morsel.public.hashtags',
  'Morsel.public.home',
  'Morsel.public.invite',
  'Morsel.public.notifications',
  'Morsel.public.requests',
  'Morsel.public.place',//place comes before morselDetail so /places/something doesn't get clobbered by '/:username/:morseldetails'...not ideal
  'Morsel.public.search',//search comes before morselDetail so /search/something doesn't get clobbered by '/:username/:morseldetails'...not ideal
  'Morsel.public.search.users',
  'Morsel.public.search.users.facebook',
  'Morsel.public.profile',//profile comes before morselDetail so /users/:id doesn't get clobbered by '/:username/:morseldetails'...not ideal
  'Morsel.public.morselDetail'
])

//define some constants for the app

//the URL to use for our API
.constant('APIURL', window.MorselConfig.apiUrl || 'https://api-staging.eatmorsel.com')

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
  'screen-lg': 'only screen and (min-width: 1200px)',
  'screen-sm-max': 'only screen and (max-width: 767px)',
  'orientation-landscape': 'screen and (orientation:landscape)'
})

.constant('MORSELPLACEHOLDER', '/assets/images/utility/placeholders/morsel-placeholder_640x640.jpg')

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider, APIURL, $provide, localStorageServiceProvider ) {
  var defaultRequestParams = {};

  $locationProvider.html5Mode(true).hashPrefix('!');

  //if we don't recognize the URL, send them to the 404 page
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

.run( function run ($window, $rootScope, $state) {
  $rootScope.$state = $state;
  $window.moment.lang('en');
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, Auth, $window, $document, Mixpanel, GA, $modalStack, $rootScope, $state, $timeout, USER_UPDATE_CHECK_TIME, ApiNotifications ) {
  var viewOptions = {
        hideHeader: false,
        headerDropdownOpen: false
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

      //display notifications badge
      ApiNotifications.getNotificationUnreadCount().then(function(notificationResp){
        $scope.notifications = {
          count: notificationResp.data.unread_count
        };
      });
    }

    if(Auth.isShadowUser()) {
      //show messaging if user is a shadow user
      $scope.shadowUser = true;
      //track in mixpanel so we know actions are "real"
      Mixpanel.register({
        is_shadow_user: true
      });
    }

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
      $scope.isStaff = Auth.isStaff();
      $scope.currentUser = userData;
    });

    //make sure we don't double count page views at the root (see home.js routing)
    if(toState.url !== '') {
      //manually push a GA pageview
      GA.sendPageview($scope.pageData.pageTitle);
    }

    resetViewOptions();

    //make sure we're at the top of the page when we change routes
    $document.scrollTop(0, 0);
  });

  //if there are internal state issues, go to 404
  $scope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams) {
    $state.go('404');
  });

  $scope.trackUserMenuClick = function(e) {
    var $dropdown = e.currentTarget && e.currentTarget.parentElement ? angular.element(e.currentTarget.parentElement) : null;

    //only track opening, not closing
    if($dropdown && !$dropdown.hasClass('open')) {
      Mixpanel.track('Opened user dropdown', {
        unread_notification_count: $scope.notifications ? $scope.notifications.count : null
      });
    }
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
});