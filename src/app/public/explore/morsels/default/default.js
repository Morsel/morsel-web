angular.module( 'Morsel.public.explore.morsels.default', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore.morsels.defaultMorsels', {
    views: {
      "default-morsels": {
        controller: 'ExploreMorselsDefaultCtrl',
        templateUrl: 'app/public/explore/morsels/default/default.tpl.html'
      }
    },
    deepStateRedirect: true,
    sticky: true
  });
})

.controller( 'ExploreMorselsDefaultCtrl', function ExploreMorselsDefaultCtrl ($scope, ApiFeed, $state){
  $scope.loadDefaultMorsels = function(endFeedItem){
    var feedParams = {
          count: $scope.exploreIncrement
        };

    if(endFeedItem) {
      feedParams.max_id = parseInt(endFeedItem.id, 10) - 1;
    }

    ApiFeed.getAllFeed(feedParams).then(function(feedItemsResp) {
      if($scope.defaultFeedItems) {
        //concat them with new data after old data, then reverse with a filter
        $scope.defaultFeedItems = $scope.defaultFeedItems.concat(feedItemsResp.data);
      } else {
        $scope.defaultFeedItems = feedItemsResp.data;
      }
    }, function() {
      //if there's an error retrieving morsels, go to 404
      $state.go('404');
    });
  };

  //get our full explore feed
  $scope.loadDefaultMorsels();
});