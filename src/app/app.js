angular.module( 'Morsel', [
  'templates-app',
  'templates-common',
  'Morsel.home',
  'Morsel.about',
  'Morsel.dashboard',
  'Morsel.post',
  'Morsel.profile',
  'Morsel.apiPosts',
  'Morsel.apiUsers',
  'restangular',
  'ui.state',
  'ui.route',
  //fakes
  'Morsel.reddit'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, RestangularProvider ) {
  $urlRouterProvider.otherwise( '/home' );

  //Restangular configuration
  RestangularProvider.setBaseUrl('http://morsel-api-staging.herokuapp.com/api/');
  RestangularProvider.setDefaultRequestParams({api_key: "1"});
  RestangularProvider.setRequestSuffix('.json');
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | Morsel' ;
    }
  });
})

;

