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

.controller( 'ExploreCtrl', function ExploreCtrl( $scope, currentUser, ApiFeed, PhotoHelpers, MORSELPLACEHOLDER ) {

  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.fullWidthHeader = true;

  $scope.goHome = function() {
    $window.open($location.protocol() + '://'+ $location.host(), '_self');
  };

  $scope.getExploreFeed = function(max_id) {
    var feedParams = {
          count: $scope.exploreIncrement
        };

    if(max_id) {
      feedParams.max_id = parseInt(max_id, 10) - 1;
    }

    ApiFeed.getAllFeed(feedParams).then(function(feedItemsData) {
      if($scope.feedItems) {
        //concat them with new data after old data, then reverse with a filter
        $scope.feedItems = feedItemsData.data.concat($scope.feedItems);
      } else {
        $scope.feedItems = feedItemsData.data;
      }
    }, function() {
      //if there's an error retrieving morsels, go to 404
      $state.go('404');
    });
  };

  $scope.getCoverPhotoArray = function(morsel) {
    var primaryItemPhotos;

    if(morsel.items) {
      primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(morsel);

      if(primaryItemPhotos) {
        return [
          ['default', primaryItemPhotos._100x100],
          ['(min-width: 321px)', primaryItemPhotos._240x240]
        ];
      } else {
        return [
          ['default', MORSELPLACEHOLDER]
        ];
      }
    } else {
      //return blank
      return [];
    }
  };

  //load our morsels immediately
  $scope.getExploreFeed();
});