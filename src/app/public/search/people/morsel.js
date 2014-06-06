angular.module( 'Morsel.public.search.people.morsel', [])

.config(function config( $stateProvider ) {
  //set up an abstract state for our main views
  $stateProvider.state( 'search.people.morsel', {
    url: '/morsel',
    views: {
      "search-results": {
        controller: 'SearchPeopleMorselCtrl',
        templateUrl: 'app/public/search/results.tpl.html'
      }
    },
    access: {
      restricted : true
    }
  });
})

.controller( 'SearchPeopleMorselCtrl', function SearchPeopleMorselCtrl ($scope, searchUser, ApiUsers){
  //override the parent scope function
  $scope.search.customSearch = _.debounce(searchMorselUsers, $scope.search.waitTime);
  
  //our initial state should be empty
  $scope.searchResultUsers = [];

  function searchMorselUsers() {
    var userSearchData = {
          'user[query]': $scope.search.query
        };

    if($scope.search.query.length >= 3) {
      //remove current users to show loader
      $scope.searchResultUsers = null;

      ApiUsers.search(userSearchData).then(function(searchResp) {
        $scope.searchResultUsers = searchResp.data;
      });
    }
  }
});