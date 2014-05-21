angular.module( 'Morsel.public.home', [
  'ui.router'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'app/public/home/home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' },
    resolve: {
       currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'HomeCtrl', function HomeCtrl( $scope, currentUser ) {
  $scope.welcomeUserName = currentUser.first_name;
});