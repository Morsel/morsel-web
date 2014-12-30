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

.controller( 'HashtagsCtrl', function HashtagsCtrl( $scope, $state, $stateParams, ApiKeywords) {
  $scope.hashtag = $stateParams.hashtag;

  $scope.emptyText = 'There are no morsels tagged #'+$stateParams.hashtag+'. <a href="/add" target="_self">Create one now</a>.';

  $scope.getMorsels = function(params) {
    ApiKeywords.getHashtagMorsels($scope.hashtag, params).then(function(morselsData) {
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
});