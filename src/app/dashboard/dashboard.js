angular.module( 'Morsel.dashboard', [
  'ui.state',
  'placeholders',
  'ui.bootstrap'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'dashboard', {
    url: '/dashboard',
    views: {
      "main": {
        controller: 'DashboardCtrl',
        templateUrl: 'dashboard/dashboard.tpl.html'
      }
    },
    data:{pageTitle: 'Dashboard' },
    access: {
      restricted : true
    }
  });
})

.controller( 'DashboardCtrl', function DashboardCtrl( $scope ) {
});
