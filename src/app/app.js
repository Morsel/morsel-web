angular.module( 'Morsel', [
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
.constant('APIURL', 'http://morsel-api-staging.herokuapp.com/api')

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, RestangularProvider, APIURL ) {
  $urlRouterProvider.otherwise( '/home' );

  //Restangular configuration
  RestangularProvider.setBaseUrl(APIURL);
  RestangularProvider.setRequestSuffix('.json');
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, Auth, userData ) {
  Auth.setupInterceptor();
  userData.then(function(data){
    console.log(data);
    $scope.currentUser = data;
  });

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    //if non logged in user tries to access a restricted route
    if(toState.access && toState.access.restricted && !Auth.isLoggedIn()) {
      event.preventDefault();
      $location.path('/login');
    }
  });

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | Morsel' ;
    }
    $scope.isLoggedIn = Auth.isLoggedIn();
    $scope.currentUser = userData;
  });
});

