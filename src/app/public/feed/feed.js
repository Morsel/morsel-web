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

.controller( 'FeedCtrl', function FeedCtrl( $scope, currentUser, ApiFeed ) {
  var feedFetchCount = 5,
      totalFetchCount = 0,
      oldestId,
      reachedOldest = false;

  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.hideFooter = true;

  $scope.morsels = [];

  $scope.goHome = function() {
    $window.open($location.protocol() + '://'+ $location.host(), '_self');
  };

  //get our initial feed items
  grabOldFeed();

  $scope.$on('feed.atMorsel', function(e, morselIndex){
    if(morselIndex === totalFetchCount-1) {
      //we're at the end of our data
      grabOldFeed();
    }
  });

  function grabOldFeed() {
    var feedParams = {
      count: feedFetchCount
    };

    //if we've already gotten the oldest items, don't keep pinging the API
    if(reachedOldest) {
      return;
    }

    if(oldestId) {
      feedParams.max_id = oldestId -1;
    }

    ApiFeed.getFeed(feedParams).then(function(feedResp){
      if(feedResp.data) {
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
        reachedOldest = true;
      }
      
    }, function(resp){
      console.log('oops, couldnt get feed');
    });
  }
});