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
    data:{ pageTitle: 'A culinary community sharing food stories, cooking inspiration and kitchen hacks' }
  });
})

.controller( 'ExploreCtrl', function ExploreCtrl($scope, $state, ApiUsers, Auth, Mixpanel){
  //some search options
  $scope.search = {
    //time to debounce keystrokes
    waitTime: 300,
    suggestedUserCount: 3,
    hideSuggestedUsers: false
  };

  Auth.getCurrentUserPromise().then(function(userData){
    //get our promoted folks
    ApiUsers.search({'user[promoted]': true}).then(function(searchResp) {
      $scope.search.defaultSuggestedUsers = _.filter(searchResp.data, function(u) {
        return !u.following && (u.id != userData.id);
      }).splice(0, $scope.search.suggestedUserCount);

      $scope.search.suggestedUsers = $scope.search.defaultSuggestedUsers;
    });
  });
});