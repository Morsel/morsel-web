angular.module( 'Morsel.public.hashtags', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'hashtags', {
    url: '/hashtags/:hashtag',
    views: {
      "main": {
        controller: 'HashtagsCtrl',
        templateUrl: 'app/public/hashtags/hashtags.tpl.html'
      }
    },
    data:{ 
      pageTitle: 'A culinary community sharing food stories, cooking inspiration and kitchen hacks'
    }
  });
})

.controller( 'HashtagsCtrl', function HashtagsCtrl( $scope, $state, $stateParams, MORSEL_LIST_NUMBER, ApiKeywords) {
  $scope.hashtag = $stateParams.hashtag;

  $scope.emptyText = 'There are no morsels tagged #'+$stateParams.hashtag+'. <a href="/add" target="_self">Create one now</a>.';

  $scope.getMorsels = function() {
    var morselsParams = {
          count: MORSEL_LIST_NUMBER
        };

    //get the next page number
    $scope.morselPageNumber = $scope.morselPageNumber ? $scope.morselPageNumber+1 : 1;
    morselsParams.page = $scope.morselPageNumber;

    ApiKeywords.getHashtagMorsels($scope.hashtag, morselsParams).then(function(morselsData) {
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
  $scope.getMorsels();
});