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

.controller( 'SearchPeopleMorselCtrl', function SearchPeopleMorselCtrl ($scope, ApiUsers, USER_LIST_NUMBER){
  //override the parent scope function
  $scope.search.customSearch = _.debounce(searchMorselUsers, $scope.search.waitTime);
  $scope.search.searchPlaceholder = 'Search for people on Morsel';
  $scope.searchType = 'morsel';
  $scope.socialSearch = false;
  //clear query when switching
  $scope.search.query = '';

  //our initial state should be empty
  $scope.searchResultUsers = [];
  $scope.hasSearched = false;

  //get our promoted folks
  ApiUsers.search({'user[promoted]': true}).then(function(searchResp) {
    $scope.suggestedUsers = searchResp.data;
  });

  $scope.loadSearchResultUsers = function(endUser){
    var userSearchData = {
          count: USER_LIST_NUMBER,
          'user[query]': $scope.search.query
        };

    if(endUser) {
      userSearchData.max_id = parseInt(endUser.id, 10) - 1;
    }

    ApiUsers.search(userSearchData).then(function(searchResp) {
      if($scope.searchResultUsers) {
        $scope.searchResultUsers = $scope.searchResultUsers.concat(searchResp.data);
      } else {
        $scope.searchResultUsers = searchResp.data;
      }

      _.defer(function(){$scope.$apply();});
    });
  };

  function searchMorselUsers() {
    if($scope.search.query.length >= 3) {
      //remove current users to show loader
      $scope.searchResultUsers = null;
      $scope.hasSearched = true;

      $scope.loadSearchResultUsers();
    } else {
      //don't show anybody if we haven't searched 3 characters
      $scope.hasSearched = false;
      $scope.searchResultUsers = [];
      _.defer(function(){$scope.$apply();});
    }
  }
});
