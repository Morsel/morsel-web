angular.module( 'Morsel.static', [
  //libs
  'restangular',
  'ui.bootstrap',
  //filters
  //API
  'Morsel.common.apiUploads',
  'Morsel.common.apiUsers',
  //templates
  'templates-static',
  //common
  'Morsel.common.auth',
  'Morsel.common.mixpanel',
  'Morsel.common.userImage'
  //app
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

.config( function myAppConfig ( $locationProvider, RestangularProvider, APIURL ) {
  var defaultRequestParams = {};

  //Restangular configuration
  RestangularProvider.setBaseUrl(APIURL);
  RestangularProvider.setRequestSuffix('.json');

})

.run( function run ($window) {
})

.controller( 'StaticCtrl', function StaticCtrl ( $scope, $location, Auth, $window, Mixpanel ) {
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
    $scope.isLoggedIn = Auth.isLoggedIn();
    
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
    $scope.menuOpen = false;
    $location.path('/'+route);
  };

  $scope.goToProfile = function() {
    if($scope.currentUser && $scope.currentUser.username) {
      $window.location.href= '/'+$scope.currentUser.username;
    }
    $scope.menuOpen = false;
  };

  $scope.currentRoute = $window.location.pathname;
});