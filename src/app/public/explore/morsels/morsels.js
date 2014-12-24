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

.controller( 'ExploreMorselsCtrl', function ExploreMorselsCtrl ($scope, MORSEL_LIST_NUMBER, $state, Mixpanel, ApiMorsels){
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

  $scope.loadDefaultMorsels = function() {
    var morselsParams = {
          count: $scope.morselSearch.exploreIncrement
        };

    //get the next page number
    $scope.defaultMorselPageNumber = $scope.defaultMorselPageNumber ? $scope.defaultMorselPageNumber+1 : 1;
    morselsParams.page = $scope.defaultMorselPageNumber;

    ApiMorsels.search(morselsParams).then(function(morselsData) {
      if($scope.defaultMorsels) {
        //concat them with new data after old data
        $scope.defaultMorsels = $scope.defaultMorsels.concat(morselsData);
      } else {
        $scope.defaultMorsels = morselsData;
      }
    }, function() {
      //if there's an error retrieving morsel data, go to explore
      $state.go('explore.morsels');
    });
  };

  //get our full explore feed
  $scope.loadDefaultMorsels();

  $scope.$on('explore.user.follow', function(event, user){
    Mixpanel.track('Followed User', {
      view: 'explore_morsels',
      promoted: user.promoted ? true : false
    });
  });
});