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

.controller( 'ExploreUsersCtrl', function ExploreUsersCtrl ($scope, ApiUsers, USER_LIST_NUMBER, SEARCH_CHAR_MINIMUM, Mixpanel){
  $scope.userSearch = {
    customFocus: function() {
      Mixpanel.track('Focused on Explore Search', {
        view: 'explore_users'
      });
    },
    customSearch: searchMorselUsers,
    form: 'userSearchForm',
    hasSearched: false,
    model: {
      query: ''
    },
    //our initial state should be empty
    searchResultUsers: []
  };

  $scope.$watch('userSearch.model.query', _.debounce(searchMorselUsers, $scope.search.waitTime));

  //hide suggested users since they'll be the main content
  $scope.search.hideSuggestedUsers = true;

  $scope.userSearch.loadSearchResultUsers = function(endUser){
    var userSearchData = {
          count: USER_LIST_NUMBER,
          'user[query]': $scope.userSearch.model.query
        };

    if(endUser) {
      userSearchData.max_id = parseInt(endUser.id, 10) - 1;
    }

    ApiUsers.search(userSearchData).then(function(searchResp) {
      if($scope.userSearch.searchResultUsers) {
        $scope.userSearch.searchResultUsers = $scope.userSearch.searchResultUsers.concat(searchResp.data);
      } else {
        $scope.userSearch.searchResultUsers = searchResp.data;
      }

      _.defer(function(){$scope.$apply();});
    });
  };

  function searchMorselUsers() {
    if($scope.userSearch.model.query && $scope.userSearch.model.query.length >= SEARCH_CHAR_MINIMUM) {
      //remove current users to show loader
      $scope.userSearch.searchResultUsers = null;
      $scope.userSearch.hasSearched = true;
      $scope.userSearch.loadSearchResultUsers();
    } else {
      $scope.userSearch.hasSearched = false;
      //don't show anybody if we haven't searched 3 characters
      $scope.userSearch.searchResultUsers = [];
      _.defer(function(){$scope.$apply();});
    }
  }

  $scope.$on('explore.user.follow', function(event, user){
    Mixpanel.track('Followed User', {
      view: 'explore_users',
      promoted: user.promoted ? true : false
    });
  });
});
