angular.module( 'Morsel', [
  'templates-app',
  'templates-common',
  'Morsel.home',
  'Morsel.about',
  'Morsel.dashboard',
  'Morsel.profile',
  'restangular',
  'ui.state',
  'ui.route'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, RestangularProvider ) {
  $urlRouterProvider.otherwise( '/home' );

  //Restangular configuration
  //use placeholder REST API for now
  RestangularProvider.setBaseUrl('http://api.reddit.com/');//'http://jsonplaceholder.typicode.com/'); //'http://morsel-api-staging.herokuapp.com/api/'
  RestangularProvider.setDefaultRequestParams({api_key: "1"});
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

