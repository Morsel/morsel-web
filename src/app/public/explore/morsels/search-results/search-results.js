angular.module( 'Morsel.public.explore.morsels.searchResults', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore.morsels.searchResults', {
    url: '/search?q&type',
    views: {
      "search-results": {
        controller: 'ExploreMorselsSearchResultsCtrl',
        templateUrl: 'app/public/explore/morsels/search-results/search-results.tpl.html'
      }
    }
  });
})

.controller( 'ExploreMorselsSearchResultsCtrl', function ExploreMorselsSearchResultsCtrl ($scope, $state, $stateParams, ApiMorsels, MORSEL_LIST_NUMBER, $previousState, ApiKeywords){
  var query;

  if($stateParams && $stateParams.q) {
    query = decodeURIComponent($stateParams.q);

    if(query.length >=3) {
      if($stateParams.type && $stateParams.type==='hashtag') {
        $scope.resultText = 'morsels tagged "#'+$stateParams.q+'"';
        $scope.emptyText = 'There are no morsels tagged "#'+$stateParams.q+'". <a href="/add" target="_self">Create one now</a>.';

        $scope.viewMoreFunc = function() {
          var morselsParams = {
                count: MORSEL_LIST_NUMBER
              };

          //get the next page number
          $scope.morselPageNumber = $scope.morselPageNumber ? $scope.morselPageNumber+1 : 1;
          morselsParams.page = $scope.morselPageNumber;

          ApiKeywords.getHashtagMorsels($stateParams.q, morselsParams).then(function(morselsData) {
            if($scope.morsels) {
              //concat them with new data after old data
              $scope.morsels = $scope.morsels.concat(morselsData);
            } else {
              $scope.morsels = morselsData;
            }
          }, function() {
            //if there's an error retrieving morsel data, go to explore
            $state.go('explore.morsels');
          });
        };
      } else {
        $scope.resultText = 'Morsels matching "'+$stateParams.q+'"';
        $scope.emptyText = 'There are no morsels matching "'+$stateParams.q+'". <a href="/add" target="_self">Create one now</a>.';

        $scope.viewMoreFunc = function() {
          var morselsParams = {
                count: MORSEL_LIST_NUMBER,
                'morsel[query]': $stateParams.q
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
            //if there's an error retrieving morsel data, go to explore
            $state.go('explore.morsels');
          });
        };
      }

      //load our morsels immediately
      $scope.viewMoreFunc();

      $scope.goBack = function() {
        //if we came from search results, go back. otherwise, go to explore
        if($previousState.get('hashtag-results')) {
          $previousState.go();
        } else {
          $state.go('explore.morsels');
        }
      };
    } else {
      $state.transitionTo('explore.morsels', null, {location:'replace'});
    }
  } else {
    $state.transitionTo('explore.morsels', null, {location:'replace'});
  }
});