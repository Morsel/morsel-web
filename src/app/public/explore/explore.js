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
    data:{ pageTitle: 'A culinary community sharing food stories, cooking inspiration and kitchen hacks' }
  });
})

.controller( 'ExploreCtrl', function ExploreCtrl($scope, $state, ApiUsers){
  //our model for search
  $scope.search = {
    query: '',
    //placeholders for children to overwrite
    customSearch: angular.noop,
    customFocus: angular.noop,
    customCancel: cancelSearch,
    //time to debounce keystrokes
    waitTime: 300,
    searchPlaceholder: 'Search Morsel',
    defaultSuggestedUsers: null,
    suggestedUsers: null,
    hideSuggestedUsers: false,
    alertMessage: null,
    alertType: null
  };

  function cancelSearch() {
    $scope.search.query = '';
  }
});