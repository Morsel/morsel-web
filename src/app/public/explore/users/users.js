angular.module( 'Morsel.public.explore.users', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore.users', {
    url: '/users',
    views: {
      "explore-users": {
        controller: 'ExploreUsersCtrl',
        templateUrl: 'app/public/explore/users/results.tpl.html'
      }
    }
  });
})

.controller( 'ExploreUsersCtrl', function ExploreUsersCtrl ($scope, ApiUsers, USER_LIST_NUMBER){
  $scope.$watch('search.query', _.debounce(searchMorselUsers, $scope.search.waitTime));

  //override the parent scope function
  $scope.search.customSearch = searchMorselUsers;
  $scope.search.searchPlaceholder = 'Search for Morsel users';
  $scope.searchType = 'users';
  $scope.search.alertMessage = null;
  $scope.hasSearched = false;
  
  //clear query when switching
  $scope.search.query = '';
  $scope.search.form.$setPristine();

  //our initial state should be empty
  $scope.searchResultUsers = [];

  //hide suggested users since they'll be the main content
  $scope.search.hideSuggestedUsers = true;

  //reset this
  $scope.search.customFocus = angular.noop();

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

  $scope.search.customClear = function() {
    $scope.search.query = '';
    $scope.search.form.$setPristine();
    $state.go('explore.morsels');
  };

  function searchMorselUsers() {
    if($scope.search.query.length >= 3) {
      //remove current users to show loader
      $scope.searchResultUsers = null;
      $scope.hasSearched = true;
      $scope.loadSearchResultUsers();
    } else {
      $scope.hasSearched = false;
      //don't show anybody if we haven't searched 3 characters
      $scope.searchResultUsers = [];
      _.defer(function(){$scope.$apply();});
    }
  }
});
