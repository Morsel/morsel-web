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

.controller( 'ExploreMorselsSearchResultsCtrl', function ExploreMorselsSearchResultsCtrl ($scope, $state, $stateParams, ApiMorsels, $previousState, ApiKeywords, Auth){
  var query,
      prevState;

  if($stateParams && $stateParams.q) {
    query = decodeURIComponent($stateParams.q);

    if(query.length >=3) {
      prevState = $previousState.get();
      //check if we came from hashtags
      if(prevState && prevState.state.name === 'explore.morsels.matchingHashtags') {
        //set this as a previous state if we need to come back
        $previousState.memo('hashtag-results');
      }

      if($stateParams.type && $stateParams.type==='hashtag') {
        $scope.resultText = 'morsels tagged "#'+$stateParams.q+'"';
        $scope.emptyText = 'There are no morsels tagged "#'+$stateParams.q+'". <a href="/add" target="_self">Create one now</a>.';

        $scope.viewMoreFunc = function(params) {
          ApiKeywords.getHashtagMorsels($stateParams.q, params).then(function(morselsResp) {
            if($scope.morsels) {
              //concat them with new data after old data
              $scope.morsels = $scope.morsels.concat(morselsResp.data);
            } else {
              $scope.morsels = morselsResp.data;
            }

            updateSuggestedUsers();
          }, function() {
            //if there's an error retrieving morsel data, go to explore
            $state.go('explore.morsels');
          });
        };
      } else {
        $scope.resultText = 'Morsels matching "'+$stateParams.q+'"';
        $scope.emptyText = 'There are no morsels matching "'+$stateParams.q+'". <a href="/add" target="_self">Create one now</a>.';

        $scope.viewMoreFunc = function(params) {
          params['morsel[query]'] = $stateParams.q;

          ApiMorsels.search(params).then(function(morselsResp) {
            if($scope.morsels) {
              //concat them with new data after old data
              $scope.morsels = $scope.morsels.concat(morselsResp.data);
            } else {
              $scope.morsels = morselsResp.data;
            }

            updateSuggestedUsers();
          }, function() {
            //if there's an error retrieving morsel data, go to explore
            $state.go('explore.morsels');
          });
        };
      }

      $scope.goBack = function() {
        //if we came from search results, go back. otherwise (direct URL), go to explore
        if($previousState.get('hashtag-results')) {
          $previousState.go('hashtag-results');
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

  function updateSuggestedUsers() {
    var morselCreators = [];

    Auth.getCurrentUserPromise().then(function(userData){
      morselCreators = _.pluck($scope.morsels, 'creator');
      morselCreators = _.filter(morselCreators, function(u) {
        return !u.following && (u.id != userData.id);
      });
      morselCreators = _.uniq(morselCreators, null, 'id').splice(0, $scope.search.suggestedUserCount);

      //if nobody is left, show defaults
      if(morselCreators.length > 0) {
        $scope.search.suggestedUsers = morselCreators;
      } else {
        $scope.search.suggestedUsers = $scope.search.defaultSuggestedUsers;
      }
    });
  }
});