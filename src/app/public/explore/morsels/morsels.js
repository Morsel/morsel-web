angular.module( 'Morsel.public.explore.morsels', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore.morsels', {
    url: '/morsels',
    views: {
      "explore-results": {
        controller: 'ExploreMorselsCtrl',
        templateUrl: 'app/public/explore/morsels/results.tpl.html'
      }
    }
  });
})

.controller( 'ExploreMorselsCtrl', function ExploreMorselsCtrl ($scope, MORSEL_LIST_NUMBER, ApiFeed, $state){
  //override the parent scope function
  $scope.search.customSearch = _.debounce(searchMorsels, $scope.search.waitTime);
  $scope.search.searchPlaceholder = 'Search for morsels';
  $scope.searchType = 'morsels';

  //clear query when switching
  $scope.search.query = '';

  //our initial state should be empty
  $scope.searchResultMorsels = [];
  $scope.hasSearched = false;

  $scope.exploreIncrement = MORSEL_LIST_NUMBER;

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

  $scope.loadSearchResultMorsels = function(endFeedItem){
    var feedParams = {
          count: $scope.exploreIncrement
        };

    if(endFeedItem) {
      feedParams.max_id = parseInt(endFeedItem.id, 10) - 1;
    }

    //REPLACE THIS WITH MORSEL SEARCH
    ApiFeed.getAllFeed(feedParams).then(function(feedItemsResp) {
      if($scope.feedItems) {
        //concat them with new data after old data, then reverse with a filter
        $scope.feedItems = $scope.feedItems.concat(feedItemsResp.data);
      } else {
        $scope.feedItems = feedItemsResp.data;
      }
    }, function() {
      //if there's an error retrieving morsels, go to 404
      $state.go('404');
    });
  };

  function searchMorsels() {
    if($scope.search.query.length >= 3) {
      //remove current users to show loader
      $scope.feedItems = null;
      $scope.hasSearched = true;

      $scope.loadSearchResultMorsels();
    } else {
      //don't show anybody if we haven't searched 3 characters
      $scope.hasSearched = false;
      $scope.feedItems = [];
      _.defer(function(){$scope.$apply();});
    }
  }
});
