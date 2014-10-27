angular.module( 'Morsel.public.explore', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore', {
    url: '/explore',
    views: {
      "main": {
        controller: 'ExploreCtrl',
        templateUrl: 'app/public/explore/explore.tpl.html'
      }
    },
    data:{ pageTitle: 'A culinary community sharing food stories, cooking inspiration and kitchen hacks' },
    resolve: {
      //get current user data before displaying so we don't run into odd situations of trying to perform user actions before user is loaded
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'ExploreCtrl', function ExploreCtrl( $scope, currentUser, ApiFeed, $location, Auth ) {
  //# of morsels to load at a time
  $scope.exploreIncrement = 15;

  $scope.getExploreFeed = function(endFeedItem) {
    var feedParams = {
          count: $scope.exploreIncrement
        };

    if(endFeedItem) {
      feedParams.max_id = parseInt(endFeedItem.id, 10) - 1;
    }

    ApiFeed.getAllFeed(feedParams).then(function(feedItemsData) {
      if($scope.feedItems) {
        //concat them with new data after old data, then reverse with a filter
        $scope.feedItems = $scope.feedItems.concat(feedItemsData.data);
      } else {
        $scope.feedItems = feedItemsData.data;
      }
    }, function() {
      //if there's an error retrieving morsels, go to 404
      $state.go('404');
    });
  };

  //load our morsels immediately
  $scope.getExploreFeed();
});