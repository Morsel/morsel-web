angular.module( 'Morsel', [
  'templates-app',
  'templates-common',
  'Morsel.home',
  'Morsel.about',
  'Morsel.dashboard',
  'Morsel.feed',
  'Morsel.morsel',
  'Morsel.post',
  'Morsel.postDetail',
  'Morsel.profile',
  'Morsel.apiMorsels',
  'Morsel.apiPosts',
  'Morsel.apiUsers',
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

