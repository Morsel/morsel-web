angular.module( 'Morsel.public.explore.morsels.matchingHashtags', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore.morsels.matchingHashtags', {
    views: {
      "matching-hashtags": {
        controller: 'ExploreMorselsMatchingHashtagsCtrl',
        templateUrl: 'app/public/explore/morsels/matching-hashtags/matching-hashtags.tpl.html'
      }
    },
    deepStateRedirect: true,
    sticky: true
  });
})

.controller( 'ExploreMorselsMatchingHashtagsCtrl', function ExploreMorselsMatchingHashtagsCtrl ($scope, ApiKeywords, $state, HandleErrors, SEARCH_CHAR_MINIMUM, $location, Mixpanel){
  $scope.$watch('morselSearch.model.query', _.debounce(searchHashtags, $scope.search.waitTime));

  //go to text results immediately upon submitting
  $scope.morselSearch.customSearch = function(e) {
    $scope.morselSearch.mixpanelSearch(function(){
      $state.go('explore.morsels.searchResults', {
        q: $scope.morselSearch.model.query
      });
    });
  };

  //start this as true
  $scope.showPromotedHashtags = true;

  $scope.loadHashtagResults = function(){
    var hashtagParams = {
          count: $scope.morselSearch.exploreIncrement,
          'keyword[query]': $scope.morselSearch.model.query
        };

    $scope.showPromotedHashtags = false;

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
    }, function(resp) {
      HandleErrors.onError(resp.data, $scope.morselSearch.form);
    });
  };

  $scope.loadPromotedHashtags = function(){
    var hashtagParams = {
          count: $scope.morselSearch.exploreIncrement,
          'keyword[promoted]': true
        };

    $scope.showPromotedHashtags = true;

    //get the next page number
    $scope.promotedHashtagPageNumber = $scope.promotedHashtagPageNumber ? $scope.promotedHashtagPageNumber+1 : 1;
    hashtagParams.page = $scope.promotedHashtagPageNumber;

    ApiKeywords.hashtagSearch(hashtagParams).then(function(hashtagsResp) {
      if($scope.promotedHashtags) {
        //concat them with new data after old data
        $scope.promotedHashtags = $scope.promotedHashtags.concat(hashtagsResp.data);
      } else {
        $scope.promotedHashtags = hashtagsResp.data;
      }
    }, function(resp) {
      HandleErrors.onError(resp.data, $scope.morselSearch.form);
    });
  };

  function searchHashtags(newValue, oldValue) {
    //remove current hashtags to show loader
    $scope.hashtagResults = null;
    //reset our page count
    $scope.hashtagResultsPageNumber = null;

    //if user has searched 3 chars, do search. if not, show promoted
    if(newValue) {
      if(newValue.length >= SEARCH_CHAR_MINIMUM) {
        $scope.loadHashtagResults();
      } else {
        //if they're not already shown
        if(!$scope.promotedHashtags || !$scope.showPromotedHashtags) {
          $scope.loadPromotedHashtags();
        }
      }
    } else {
      //if they're not already shown
      if(!$scope.promotedHashtags || !$scope.showPromotedHashtags) {
        $scope.loadPromotedHashtags();
      }
    }
  }

  $scope.formatQuery = function(q) {
    return encodeURIComponent(q);
  };

  $scope.clickHashtag = function(hashtag, promoted) {
    //send this off, let event continue
    Mixpanel.track('Clicked Hashtag', {
      hashtag: '#'+hashtag,
      view: 'explore_morsels',
      //explicitly set false to avoid 'undefined' in mixpanel
      promoted: promoted ? true : false
    });
  };

  $scope.clickSearchResult = function() {
    Mixpanel.track('Explore searched', {
      view: 'explore_morsels',
      explore_search_trigger: 'Clicked result',
      search_term: $scope.morselSearch.model.query
    });
  };
});