angular.module( 'Morsel.home', [
  'ui.state',
  'infinite-scroll'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/home',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' }
  });
})

.controller( 'HomeCtrl', function HomeCtrl( $scope, Auth ) {
  $scope.welcomeUserName = Auth.currentUser.first_name;
});