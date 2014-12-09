angular.module( 'Morsel.public.explore', [])
.constant('SEARCH_CHAR_MINIMUM', 3)

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
  //some search options
  $scope.search = {
    //time to debounce keystrokes
    waitTime: 300,
    suggestedUserCount: 3,
    hideSuggestedUsers: false
  };

  //get our promoted folks
  ApiUsers.search({'user[promoted]': true}).then(function(searchResp) {
    $scope.search.defaultSuggestedUsers = _.filter(searchResp.data, function(u) {
      return !u.following;
    }).splice(0, $scope.search.suggestedUserCount);

    $scope.search.suggestedUsers = $scope.search.defaultSuggestedUsers;
  });
});