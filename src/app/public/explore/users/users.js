angular.module( 'Morsel.public.explore.users', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore.users', {
    url: '/users',
    views: {
      "explore-results": {
        controller: 'ExploreUsersCtrl',
        templateUrl: 'app/public/explore/users/results.tpl.html'
      }
    }
  });
})

.controller( 'ExploreUsersCtrl', function ExploreUsersCtrl (){
});
