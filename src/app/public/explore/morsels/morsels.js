angular.module( 'Morsel.public.explore.morsels', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore.morsels', {
    url: '/morsels?q',
    views: {
      "explore-results": {
        controller: 'ExploreMorselsCtrl',
        templateUrl: 'app/public/explore/morsels/results.tpl.html'
      }
    },
    reloadOnSearch: false
  });
})

.controller( 'ExploreMorselsCtrl', function ExploreMorselsCtrl ($scope, MORSEL_LIST_NUMBER, ApiFeed, ApiMorsels, ApiUsers, ApiKeywords, $state, $stateParams, $rootScope, $modal, $location){
  var suggestedUserNumber = 3,
      //used to check if we need to do anything
      oldSearchQuery = '',
      HashtagModalInstanceCtrl,
      SearchResultModalInstanceCtrl;
  
  $scope.$watch('search.query', _.debounce(searchHashtags, $scope.search.waitTime));
  //override the parent scope function
  //$scope.search.customSearch = _.debounce(searchHashtags, $scope.search.waitTime);
  $scope.search.searchPlaceholder = 'Search morsels';
  $scope.searchType = 'morsels';
  $scope.search.alertMessage = null;

  //clear query when switching
  $scope.search.query = '';

  //our initial state should be empty
  $scope.searchResultMorsels = [];
  $scope.hasSearched = false;

  //show suggested users
  $scope.search.hideSuggestedUsers = false;

  //start with default morsels
  $scope.showDefaultMorsels = true;

  $scope.exploreIncrement = MORSEL_LIST_NUMBER;

  //get our promoted folks
  ApiUsers.search({'user[promoted]': true}).then(function(searchResp) {
    $scope.search.defaultSuggestedUsers = _.filter(searchResp.data, function(u) {
      return !u.following;
    }).splice(0, suggestedUserNumber);

    $scope.search.suggestedUsers = $scope.search.defaultSuggestedUsers;
  });

  //on focus of search, show promoted hashtags
  $scope.search.customFocus = function() {
    $scope.showDefaultMorsels = false;
    $scope.search.query = $scope.search.query;
  };

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

  //don't use first param, which is for viewMore
  $scope.loadHashtagResults = function(dontUse, promoted){
    var hashtagParams = {
          count: $scope.exploreIncrement
        };

    if(promoted) {
      hashtagParams['keyword[promoted]'] = true;
      $scope.showPromotedHashtags = true;
    } else {
      hashtagParams['keyword[query]'] = $scope.search.query;
      $scope.showPromotedHashtags = false;
    }

    //get the next page number
    $scope.hashtagResultsPageNumber = $scope.hashtagResultsPageNumber ? $scope.hashtagResultsPageNumber+1 : 1;
    hashtagParams.page = $scope.hashtagResultsPageNumber;

    ApiKeywords.hashtagSearch(hashtagParams).then(function(hashtagsResp) {
      $scope.search.alertMessage = null;

      if($scope.hashtagResults) {
        //concat them with new data after old data
        $scope.hashtagResults = $scope.hashtagResults.concat(hashtagsResp.data);
      } else {
        $scope.hashtagResults = hashtagsResp.data;
      }
    }, function() {
      //if there's an error retrieving hashtags, show message
      $scope.search.alertMessage = 'There was a problem with your search. Please try again';
      $scope.search.alertType = 'danger';
    });
  };

  function searchHashtags(newValue, oldValue) {
    //if this is happening on a form submission, skip the hashtags and go straight to the text search
    /*if(formSubmitted) {
      $scope.openSearchResultOverlay();
    }*/

    //remove current hashtags to show loader
    $scope.hashtagResults = null;
    //reset our page count
    $scope.hashtagResultsPageNumber = null;
    $scope.hasSearched = true;

    if(newValue && newValue.length >= 3) {
      $scope.loadHashtagResults();
    } else if(newValue && (oldValue && (oldValue.length >= 3 || newValue.length === 0))){
      //show promoted hashtags if we haven't searched 3 characters (don't re-search if we don't need to)
      $scope.loadHashtagResults(null, true);
    }

    //$location.search('q', $scope.search.query);
  }

  $scope.openHashtagOverlay = function(hashtag) {
    $rootScope.modalInstance = $modal.open({
      templateUrl: 'common/morsels/morselGridOverlay.tpl.html',
      controller: HashtagModalInstanceCtrl,
      size: 'lg',
      resolve: {
        hashtag: function () {
          return hashtag;
        }
      }
    });
  };

  HashtagModalInstanceCtrl = function ($scope, $modalInstance, MORSEL_LIST_NUMBER, hashtag) {
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.heading = '#'+hashtag.name;

    $scope.emptyText = 'There are no morsels tagged #'+hashtag.name+'. <a href="/add" target="_self">Create one now</a>.';

    $scope.viewMoreFunc = function() {
      var morselsParams = {
            count: MORSEL_LIST_NUMBER
          };

      //get the next page number
      $scope.morselPageNumber = $scope.morselPageNumber ? $scope.morselPageNumber+1 : 1;
      morselsParams.page = $scope.morselPageNumber;

      ApiKeywords.getHashtagMorsels(hashtag.name, morselsParams).then(function(morselsData) {
        if($scope.morsels) {
          //concat them with new data after old data
          $scope.morsels = $scope.morsels.concat(morselsData);
        } else {
          $scope.morsels = morselsData;
        }
      }, function() {
        //if there's an error retrieving morsel data, go to 404
        $state.go('404');
      });
    };

    //load our morsels immediately
    $scope.viewMoreFunc();
  };
  //we need to implicitly inject dependencies here, otherwise minification will botch them
  HashtagModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'MORSEL_LIST_NUMBER', 'hashtag'];

  $scope.openSearchResultOverlay = function() {
    $rootScope.modalInstance = $modal.open({
      templateUrl: 'common/morsels/morselGridOverlay.tpl.html',
      controller: SearchResultModalInstanceCtrl,
      size: 'lg',
      resolve: {
        query: function () {
          return $scope.search.query;
        }
      }
    });
  };

  SearchResultModalInstanceCtrl = function ($scope, $modalInstance, ApiMorsels, MORSEL_LIST_NUMBER, query) {
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.heading = 'Results for "'+query+'"';

    $scope.emptyText = 'There are no morsels matching "'+query+'". <a href="/add" target="_self">Create one now</a>.';

    $scope.viewMoreFunc = function() {
      var morselsParams = {
            count: MORSEL_LIST_NUMBER,
            'morsel[query]': query
          };

      //get the next page number
      $scope.morselPageNumber = $scope.morselPageNumber ? $scope.morselPageNumber+1 : 1;
      morselsParams.page = $scope.morselPageNumber;

      ApiMorsels.search(morselsParams).then(function(morselsData) {
        if($scope.morsels) {
          //concat them with new data after old data
          $scope.morsels = $scope.morsels.concat(morselsData);
        } else {
          $scope.morsels = morselsData;
        }
      }, function() {
        //if there's an error retrieving morsel data, go to 404
        $state.go('404');
      });
    };

    //load our morsels immediately
    $scope.viewMoreFunc();
  };
  //we need to implicitly inject dependencies here, otherwise minification will botch them
  SearchResultModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'ApiMorsels','MORSEL_LIST_NUMBER', 'query'];
});
