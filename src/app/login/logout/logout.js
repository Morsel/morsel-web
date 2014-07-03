angular.module( 'Morsel.login.logout', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'auth.logout', {
    url: '/logout',
    parent: 'auth',
    views: {
      "auth-view": {
        controller: 'LogoutCtrl'
      }
    },
    data:{ pageTitle: 'Logout' }
  });
})

.controller( 'LogoutCtrl', function LogoutCtrl( $scope, $stateParams, Auth ) {
  $scope.viewOptions.hideHeader = true;
  Auth.logout();
});