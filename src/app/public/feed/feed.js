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

.controller( 'FeedCtrl', function FeedCtrl( $scope, currentUser, ApiFeed, $interval ) {
  var feedFetchCount = 5, //the number of feed items to fetch at a time from the server
      totalFetchCount = 0, //the total number of feed items that have been fetched from the server
      oldestId, //the id of the oldest morsel fetched from the server
      fetchThreshold = 2, //how many feed items away from the last one we have data for before we fetch more
      oldestDisplayFeedItemIndex, //keeping track of the index on the right that is rendered
      newFeedItems = [], //hold any feed item data that comes back from the server after the initial load
      newFeedItemCheckTime = 60000; //milliseconds to wait between checks of new feed items from server

  $scope.feedItems = []; //our feed item array
  $scope.reachedOldest = false; //whether or not we've gotten to the end of the data
  $scope.newFeedItemCount = 0; //how many feed items are newer than what's been loaded so far

  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.hideFooter = true;

  $scope.goHome = function() {
    $window.open($location.protocol() + '://'+ $location.host(), '_self');
  };

  //get our initial feed items
  grabOldFeed();

  //every newFeedItemCheckTime seconds, check for new feed items
  $interval(function(){
    grabNewFeed();
  }, newFeedItemCheckTime);

  //when user moves to a new feed item
  $scope.$on('feed.atMorsel', function(e, morselIndex){
    if(totalFetchCount !== 0) {
      //make sure we've fetched data already before we start trying to get more

      if(totalFetchCount - (morselIndex + 1) <= fetchThreshold) {
        //we're within fetchThreshold feed items of the end of the data
        grabOldFeed();
      }
    }
  });

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
          //only allow morsels for now
          if(f.subject_type==='Morsel') {
            $scope.feedItems.push(f);
            totalFetchCount++;
          }
        });

        //the oldest id we have fetched from the server so far
        oldestId = _.last(feedResp.data)['id'];
      } else {
        //there are no more feed items to get, we've gone all the way back
        $scope.reachedOldest = true;
      }
    }, function(resp){
      console.log('oops, couldnt get feed');
    });
  }

  function grabNewFeed() {
    var feedParams = {},
        sinceId;

    //grab the newest id in our array
    if($scope.feedItems.length > 0) {
      sinceId = $scope.feedItems[0]['id'];

      if(sinceId) {
        feedParams.since_id = sinceId;
      } else {
        return;
      }
    } else {
      return;
    }

    ApiFeed.getFeed(feedParams).then(function(feedResp){
      //reset our new feed items array
      newFeedItems = [];

      if(feedResp.data && feedResp.data.length > 0) {
        //get all our feed items in an array and count them
        //only allow morsels for now
        _.each(feedResp.data, function(f) {
          if(f.subject_type==='Morsel') {
            newFeedItems.push(f);
          }
        });

        $scope.newFeedItemCount = newFeedItems.length;
      }
    }, function(resp){
      console.log('oops, couldnt get feed');
    });
  }

  $scope.showNewFeedItems = function(){
    //user wants to see new feed items - add them to the front of the main array
    newFeedItems.push.apply(newFeedItems, $scope.feedItems);

    $scope.feedItems = newFeedItems;

    //reset the new feed items array
    newFeedItems = [];
    $scope.newFeedItemCount = newFeedItems.length;

    //send user back to first feed item
    $scope.currentControlIndex = 0;
  };
});