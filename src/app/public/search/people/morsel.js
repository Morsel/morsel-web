angular.module( 'Morsel.public.search.people.morsel', [])

.config(function config( $stateProvider ) {
  //set up an abstract state for our main views
  $stateProvider.state( 'search.people.morsel', {
    //blank so it'll be the default for /search/people
    url: '',
    views: {
      "search-results": {
        controller: 'SearchPeopleMorselCtrl',
        templateUrl: 'app/public/search/results.tpl.html'
      }
    }
  });
})

.controller( 'SearchPeopleMorselCtrl', function SearchPeopleMorselCtrl ($scope, searchUser, ApiUsers){
  //override the parent scope function
  $scope.search.customSearch = _.debounce(searchMorselUsers, $scope.search.waitTime);
  $scope.search.searchPlaceholder = 'Search for people on Morsel';
  
  //our initial state should be empty
  $scope.searchResultUsers = [];

  //get our promoted folks
  ApiUsers.search({'user[promoted]': true}).then(function(searchResp) {
    $scope.suggestedUsers = searchResp.data;
  });

  function searchMorselUsers() {
    var userSearchData = {
          'user[query]': $scope.search.query
        };

    if($scope.search.query.length >= 3) {
      //remove current users to show loader
      $scope.searchResultUsers = null;

      ApiUsers.search(userSearchData).then(function(searchResp) {
        $scope.searchResultUsers = searchResp.data;
        _.defer(function(){$scope.$apply();});
      });
    } else {
      //don't show anybody if we haven't searched 3 characters
      $scope.searchResultUsers = [];
      _.defer(function(){$scope.$apply();});
    }
  }
});
