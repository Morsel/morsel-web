angular.module( 'Morsel', [
  //templates
  'templates-app',
  'templates-common',
  //app
  'Morsel.about',
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
  'Morsel.userData',
  //API
  'Morsel.apiMorsels',
  'Morsel.apiPosts',
  'Morsel.apiUsers',
  //libs
  'restangular',
  'ui.state',
  'ui.route',
  //fakes
  'Morsel.reddit'
])
//the URL to use for our API
.constant('APIURL', 'https://morsel-api-staging.herokuapp.com/api')

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, RestangularProvider, APIURL ) {
  //if we don't recognize the URL, send it to the homepage for now
  $urlRouterProvider.otherwise( '/home' );

  //Restangular configuration
  RestangularProvider.setBaseUrl(APIURL);
  RestangularProvider.setRequestSuffix('.json');
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, Auth, userData ) {
  Auth.setupInterceptor();
  //initial fetching of user data for header/footer
  updateUserData();

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
    userData.then(function(data){
      $scope.currentUserName = data.first_name;
      $scope.currentUserId = data.id;
    });
  }
});

