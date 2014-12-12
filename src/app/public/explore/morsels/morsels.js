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

.controller( 'ExploreMorselsCtrl', function ExploreMorselsCtrl ($scope, MORSEL_LIST_NUMBER, ApiFeed, $state, Mixpanel){
  $scope.morselSearch = {
    exploreIncrement: MORSEL_LIST_NUMBER,
    customFocus: function() {
      Mixpanel.track('Focused on Explore Search', {
        view: 'explore_morsels'
      }, function() {
        $state.transitionTo('explore.morsels.matchingHashtags', null, {location:'replace'});
      });
    },
    customClear: function() {
      $state.go('explore.morsels');
    },
    form: 'morselSearchForm',
    model: {
      query: ''
    },
    mixpanelSearch: function(callback) {
      Mixpanel.track('Explore searched', {
        view: 'explore_morsels',
        explore_search_trigger: 'Form Submit',
        search_term: $scope.morselSearch.model.query
      }, callback);
    }
  };

  //show suggested users
  $scope.search.hideSuggestedUsers = false;

  $scope.loadDefaultMorsels = function(endFeedItem){
    var feedParams = {
          count: $scope.morselSearch.exploreIncrement
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

  $scope.$on('explore.user.follow', function(event, details){
    Mixpanel.track('Followed User', {
      view: 'explore_morsels'
    });
  });
});