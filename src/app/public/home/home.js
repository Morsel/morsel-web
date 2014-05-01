angular.module( 'Morsel.public.home', [
  'ui.state'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/home',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'public/home/home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' },
    resolve: {
      hasCurrentUser : function(Auth) {
        return Auth.hasCurrentUser();
      }
    }
  });
})

.controller( 'HomeCtrl', function HomeCtrl( $scope, Auth ) {
  $scope.welcomeUserName = Auth.getCurrentUser().first_name;
});