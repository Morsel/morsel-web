angular.module( 'Morsel.public.feed', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'feed', {
    url: '/feed',
    views: {
      "main": {
        controller: 'FeedCtrl',
        templateUrl: 'app/public/feed/feed.tpl.html'
      }
    },
    data:{ pageTitle: 'Your Feed' },
    resolve: {
      //get current user data before displaying so we don't run into odd situations of trying to perform user actions before user is loaded
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'FeedCtrl', function FeedCtrl( $scope, currentUser, ApiFeed, $timeout ) {
  var feedFetchCount = 5, //the number of morsels to fetch at a time from the server
      totalFetchCount = 0, //the total number of morsels that have been fetched from the server
      oldestId, //the id of the oldest morsel fetched from the server
      currentFeedItemIndex = 0, //the index of the feed item the user is currently on
      fetchThreshold = 2 //how many morsels away from the last one we have data for before we fetch more
      ;

  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.hideFooter = true;

  $scope.morsels = [];
  $scope.reachedOldest = false;

  $scope.goHome = function() {
    $window.open($location.protocol() + '://'+ $location.host(), '_self');
  };

  //get our initial feed items
  grabOldFeed();

  //when user moves to a new feed item
  $scope.$on('feed.atMorsel', function(e, morselIndex){
    //update the current index that a user is on. two things need to happen here -
    //1. need to check if we should load any more data from the server
    //2. need to update what is being displayed in the DOM so it doesn't become overloaded
    currentFeedItemIndex = morselIndex;
    updateMorselData();
  });

  function updateMorselData() {
    if(totalFetchCount !== 0) {
      //make sure we've fetched data already before we start trying to get more

      if(totalFetchCount - (currentFeedItemIndex + 1) <= fetchThreshold) {
        //we're within fetchThreshold morsels of the end of the data
        grabOldFeed();
      }
    }
  }

  function grabOldFeed() {
    var feedParams = {
      count: feedFetchCount
    };

    //if we've already gotten the oldest items, don't keep pinging the API
    if($scope.reachedOldest) {
      return;
    }

    if(oldestId) {
      feedParams.max_id = oldestId -1;
    }

    ApiFeed.getFeed(feedParams).then(function(feedResp){
      if(feedResp.data && feedResp.data.length > 0) {
        _.each(feedResp.data, function(f) {
          if(f.subject_type==='Morsel') {
            $scope.morsels.push(f.subject);
            totalFetchCount++;
          }
        });

        //the oldest id we have fetched from the server so far
        oldestId = _.last(feedResp.data)['id'];
      } else {
        //there are no more feed items to get, we've gone all the way back
        $scope.reachedOldest = true;
      }
      console.log($scope.morsels);
    }, function(resp){
      console.log('oops, couldnt get feed');
    });
  }
});