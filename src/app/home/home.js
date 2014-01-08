angular.module( 'Morsel.home', [
  'ui.state',
  'infinite-scroll',
  'allMorselPosts'
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

.controller( 'HomeCtrl', function HomeController( $scope, AllMorselPosts ) {
  $scope.morselPosts = new AllMorselPosts();
});