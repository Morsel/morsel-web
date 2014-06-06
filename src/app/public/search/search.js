angular.module( 'Morsel.public.search', [])

.config(function config( $stateProvider ) {
  //set up an abstract state for our main views
  $stateProvider.state( 'search', {
    abstract: true,
    url: '/search',
    views: {
      "main": {
        controller: 'SearchCtrl',
        templateUrl: 'app/public/search/search.tpl.html'
      }
    },
    access: {
      restricted : true
    },
    resolve: {
      //make sure we resolve a user before displaying
      searchUser:  function(Auth){
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'SearchCtrl', function SearchCtrl ($scope, searchUser){
});
