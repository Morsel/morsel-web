angular.module( 'Morsel.login.logout', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'logout', {
    url: '/logout',
    views: {
      "main": {
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