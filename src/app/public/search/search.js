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
    data: {
      pageTitle: 'Search for Other Users Including Chefs, Mixologists & Sommeliers'
    },
    resolve: {
      //make sure we resolve a user before displaying
      searchUser:  function(Auth){
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'SearchCtrl', function SearchCtrl ($scope, searchUser, Auth, $state){
  //our model for search
  $scope.search = {
    query: '',
    //placeholder for children to overwrite
    customSearch: angular.noop,
    //time to debounce keystrokes
    waitTime: 300,
    searchPlaceholder: 'Search for friends on Morsel'
  };

  $scope.searchUser = searchUser;
  $scope.isLoggedIn = Auth.isLoggedIn();

  $state.go('search.people', null, {location:'replace'});
});
