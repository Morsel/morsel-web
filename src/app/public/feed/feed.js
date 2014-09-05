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
    data:{ pageTitle: 'A culinary community sharing food stories, cooking inspiration and kitchen hacks' },
    resolve: {
      //get current user data before displaying so we don't run into odd situations of trying to perform user actions before user is loaded
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'FeedCtrl', function FeedCtrl( $scope, currentUser, ApiFeed, $interval, Auth ) {
  var feedFetchCount = 9, //the number of feed items to fetch at a time from the server
      totalFetchCount = 0, //the total number of feed items that have been fetched from the server
      oldestDisplayFeedItemIndex, //keeping track of the index on the right that is rendered
      newFeedItems = [], //hold any feed item data that comes back from the server after the initial load
      newFeedItemCheckTime = 180000; //milliseconds to wait between checks of new feed items from server

  $scope.feedItemIncrement = feedFetchCount; //expose for View More
  $scope.newFeedItemCount = 0; //how many feed items are newer than what's been loaded so far

  $scope.grabOldFeed = function(max_id) {
    var feedParams = {
      count: feedFetchCount
    };

    if(max_id) {
      feedParams.max_id = parseInt(max_id, 10) - 1;
    }

    ApiFeed.getFeed(feedParams).then(function(feedResp){
      var feedData = feedResp.data;

      _.each(feedData, function(f) {
        //only allow morsels for now
        if(f.subject_type==='Morsel' && f.subject) {
          //persist the featured data to the morsel level so it's available within the morsel directive
          f.subject.featured = f.featured;
          totalFetchCount++;
        }
      });

      if($scope.feedItems) {
        $scope.feedItems = $scope.feedItems.concat(feedData);
      } else {
        $scope.feedItems = feedData;
      }

    }, function(resp){
      if(resp.data && resp.data.errors && resp.data.errors.api) {
        //resp returned an api issue
        //report and error back to user
        Auth.showApiError(resp.status, resp.data.errors);
      }
    });
  };

  //get our initial feed items
  $scope.grabOldFeed();

  //every newFeedItemCheckTime seconds, check for new feed items
  $interval(function(){
    grabNewFeed();
  }, newFeedItemCheckTime);

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
      if(resp.data && resp.data.errors && resp.data.errors.api) {
        //resp returned an api issue
        //report and error back to user
        Auth.showApiError(resp.status, resp.data.errors);
      }
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