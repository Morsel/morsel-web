angular.module( 'Morsel.public.explore.morsels', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore.morsels', {
    url: '/morsels',
    views: {
      "explore-morsels": {
        controller: 'ExploreMorselsCtrl',
        templateUrl: 'app/public/explore/morsels/results.tpl.html'
      }
    }
  });
})

.controller( 'ExploreMorselsCtrl', function ExploreMorselsCtrl ($scope, MORSEL_LIST_NUMBER, ApiFeed, ApiMorsels, ApiKeywords, $state, $stateParams, $rootScope, $modal, $location){
  //override the parent scope function
  $scope.search.searchPlaceholder = 'Search morsels';
  $scope.searchType = 'morsels';

  //clear query when switching
  $scope.search.query = '';
  $scope.search.form.$setPristine();

  //show suggested users
  $scope.search.hideSuggestedUsers = false;

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

  //on focus of search, show hashtag search
  $scope.search.customFocus = function() {
    $state.transitionTo('explore.morsels.matchingHashtags', null, {location:'replace'});
  };
});

/*
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

    
  //we need to implicitly inject dependencies here, otherwise minification will botch them
  SearchResultModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'ApiMorsels','MORSEL_LIST_NUMBER', 'query'];

  
*/