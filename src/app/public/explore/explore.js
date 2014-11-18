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

.controller( 'ExploreCtrl', function ExploreCtrl( $scope, ApiFeed, $location, Auth, MORSEL_LIST_NUMBER, $state){
  //our model for search
  $scope.search = {
    query: '',
    //placeholder for children to overwrite
    customSearch: angular.noop,
    //time to debounce keystrokes
    waitTime: 300,
    searchPlaceholder: 'Search Morsel'
  };

  $state.go('explore.morsels');
  
  //old explore
  

  //# of morsels to load at a time
  /*$scope.exploreIncrement = MORSEL_LIST_NUMBER;

  $scope.getExploreFeed = function(endFeedItem) {
    var feedParams = {
          count: $scope.exploreIncrement
        };

    if(endFeedItem) {
      feedParams.max_id = parseInt(endFeedItem.id, 10) - 1;
    }

    ApiFeed.getAllFeed(feedParams).then(function(feedItemsData) {
      if($scope.feedItems) {
        //concat them with new data after old data, then reverse with a filter
        $scope.feedItems = $scope.feedItems.concat(feedItemsData.data);
      } else {
        $scope.feedItems = feedItemsData.data;
      }
    }, function() {
      //if there's an error retrieving morsels, go to 404
      $state.go('404');
    });
  };

  //load our morsels immediately
  $scope.getExploreFeed();*/
});