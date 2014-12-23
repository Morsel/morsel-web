angular.module( 'Morsel.static', [
  //libs
  'duScroll',
  'LocalStorageModule',
  'restangular',
  'ui.bootstrap',
  //filters
  //API
  'Morsel.common.apiNotifications',
  'Morsel.common.apiUploads',
  'Morsel.common.apiUsers',
  //templates
  'templates-static',
  //common
  'Morsel.common.auth',
  'Morsel.common.headerScroll',
  'Morsel.common.iTunesLink',
  'Morsel.common.mixpanel',
  'Morsel.common.rollbar',
  'Morsel.common.userImage',
  'Morsel.common.usersName'
  //app
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

.config( function myAppConfig ( $locationProvider, RestangularProvider, APIURL, $provide, localStorageServiceProvider ) {
  var defaultRequestParams = {};

  //Restangular configuration
  RestangularProvider.setBaseUrl(APIURL);
  RestangularProvider.setRequestSuffix('.json');

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
})

.controller( 'StaticCtrl', function StaticCtrl ( $scope, $location, Auth, $window, $document, Mixpanel, $timeout, USER_UPDATE_CHECK_TIME, ApiNotifications ) {
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

  $scope.currentRoute = $window.location.pathname;
});