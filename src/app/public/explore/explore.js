angular.module( 'Morsel.public.explore', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore', {
    url: '/explore',
    views: {
      "main": {
        controller: 'ExploreCtrl',
        templateUrl: 'app/public/explore/explore.tpl.html'
      }
    },
    data:{ pageTitle: 'A culinary community sharing food stories, cooking inspiration and kitchen hacks' },
    deepStateRedirect: true,
    sticky: true
  });
})

.controller( 'ExploreCtrl', function ExploreCtrl($scope, $state, ApiUsers){
  //our model for search
  $scope.search = {
    query: '',
    //placeholders for children to overwrite
    customSearch: angular.noop,
    customFocus: angular.noop,
    customClear: angular.noop,

    //time to debounce keystrokes
    waitTime: 300,
    searchPlaceholder: 'Search Morsel',
    defaultSuggestedUsers: null,
    suggestedUsers: null,
    suggestedUserCount: 3,
    hideSuggestedUsers: false,
    queryMinimumLength: 3
  };

  //search length validation
  $scope.queryLengthValidation = {
    'length': {
      'min': $scope.search.queryMinimumLength,
      'message': 'Search must be at least 3 characters'
    }
  };

  $scope.search.customClear = function() {
    $scope.search.query = '';
    $scope.search.form.$setPristine();
    $state.go('explore.morsels');
  };

  //get our promoted folks
  ApiUsers.search({'user[promoted]': true}).then(function(searchResp) {
    $scope.search.defaultSuggestedUsers = _.filter(searchResp.data, function(u) {
      return !u.following;
    }).splice(0, $scope.search.suggestedUserCount);

    $scope.search.suggestedUsers = $scope.search.defaultSuggestedUsers;
  });
});