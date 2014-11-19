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

.controller( 'ExploreUsersCtrl', function ExploreUsersCtrl ($scope, ApiUsers, USER_LIST_NUMBER){
  //override the parent scope function
  $scope.search.customSearch = _.debounce(searchMorselUsers, $scope.search.waitTime);
  $scope.search.searchPlaceholder = 'Search for Morsel users';
  $scope.searchType = 'users';

  //clear query when switching
  $scope.search.query = '';

  //our initial state should be empty
  $scope.searchResultUsers = [];
  $scope.hasSearched = false;

  //hide suggested users since they'll be the main content
  $scope.search.hideSuggestedUsers = true;

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
