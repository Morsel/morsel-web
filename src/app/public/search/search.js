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
      pageTitle: 'Search'
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
  //our model for search
  $scope.search = {
    query: '',
    customSearch: search,
    //time to debounce keystrokes
    waitTime: 300
  };

  function search() {
    //do nothing
  }
});
