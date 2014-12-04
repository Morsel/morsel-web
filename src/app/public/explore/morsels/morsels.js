angular.module( 'Morsel.public.explore.morsels', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore.morsels', {
    url: '/morsels?q',
    views: {
      "explore-results": {
        controller: 'ExploreMorselsCtrl',
        templateUrl: 'app/public/explore/morsels/results.tpl.html'
      }
    }
  });
})

.controller( 'ExploreMorselsCtrl', function ExploreMorselsCtrl ($scope, MORSEL_LIST_NUMBER, ApiFeed, ApiUsers, ApiKeywords, $state, $stateParams){
  var suggestedUserNumber = 3;
  
  //override the parent scope function
  $scope.search.customSearch = _.debounce(searchHashtags, $scope.search.waitTime);
  $scope.search.searchPlaceholder = 'Search morsels';
  $scope.searchType = 'morsels';

  //clear query when switching
  $scope.search.query = '';

  //our initial state should be empty
  $scope.searchResultMorsels = [];
  $scope.hasSearched = false;

  //show suggested users
  $scope.search.hideSuggestedUsers = false;

  //get our promoted folks
  ApiUsers.search({'user[promoted]': true}).then(function(searchResp) {
    $scope.search.defaultSuggestedUsers = _.filter(searchResp.data, function(u) {
      return !u.following;
    }).splice(0, suggestedUserNumber);

    $scope.search.suggestedUsers = $scope.search.defaultSuggestedUsers;
  });

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

  $scope.loadHashtagResults = function(){
    var hashtagParams = {
          count: $scope.exploreIncrement,
          'keyword[query]': $scope.search.query
        };

    //get the next page number
    $scope.hashtagResultsPageNumber = $scope.hashtagResultsPageNumber ? $scope.hashtagResultsPageNumber+1 : 1;
    hashtagParams.page = $scope.hashtagResultsPageNumber;

    ApiKeywords.hashtagSearch(hashtagParams).then(function(hashtagsResp) {
      if($scope.hashtagResults) {
        //concat them with new data after old data
        $scope.hashtagResults = $scope.hashtagResults.concat(hashtagsResp.data);
      } else {
        $scope.hashtagResults = hashtagsResp.data;
      }
    }, function() {
      //if there's an error retrieving hashtags, go to 404
      $state.go('404');
    });
  };

  function searchHashtags() {
    if($scope.search.query.length >= 3) {
      //remove current hashtags to show loader
      $scope.hashtagResults = null;
      //reset our page count
      $scope.hashtagResultsPageNumber = null;
      $scope.hasSearched = true;

      $scope.loadHashtagResults();
    } else {
      //don't show any hashtags if we haven't searched 3 characters
      $scope.hasSearched = false;
      $scope.hashtagResults = null;
      //reset our page count
      $scope.hashtagResultsPageNumber = null;
      _.defer(function(){$scope.$apply();});
    }
  }
});
