angular.module( 'Morsel.public.morselDetail', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'morselDetail', {
    //make sure our "username" isn't "users"
    url: '/:username/{morselDetails:.*}?source&feedId',
    views: {
      "main": {
        controller: 'MorselDetailCtrl',
        templateUrl: 'app/public/morsel-detail/morsel-detail.tpl.html'
      }
    },
    data:{ pageTitle: 'Morsel Detail' },
    resolve: {
      //get current user data before displaying so we don't run into odd situations of trying to perform user actions before user is loaded
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      },
      theMorsel: function($location, $stateParams, ApiMorsels, $q) {
        var username = $stateParams.username.toLowerCase(),
            morselDetailsArr = $stateParams.morselDetails.split('/'),
            morselIdSlug = morselDetailsArr[0];/*,
            itemNumber = parseInt(morselDetailsArr[1], 10);*/

        //check and make sure we pulled an idslug from the URL
        if(morselIdSlug && username) {
          return ApiMorsels.getMorsel(morselIdSlug).then(function(morselData){
            if (username != morselData.creator.username.toLowerCase()) {
              //this isn't a valid morsel for this user
              $location.path('/'+username);
            } else {
              return morselData;
            }
          }, function() {
            //if there's an error retrieving morsel data (bad id?), go to profile page for now
            $location.path('/'+username);
          });
        } else {
          //if not, send to profile page
          $location.path('/'+username);
        }
      }
    }
  });
})

.controller( 'MorselDetailCtrl', function MorselDetailCtrl( $scope, $stateParams, ApiMorsels, ApiUsers, ApiFeed, $location, $window, currentUser, theMorsel ) {
  $scope.morsel = theMorsel;
  //update page title
  $scope.pageData.pageTitle = $scope.morsel.title+' - '+$scope.morsel.creator.first_name+' '+$scope.morsel.creator.last_name+' | Morsel';

  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.fullWidthHeader = true;

  //check if we came from the feed and should display prev/next links
  if($stateParams.source === 'feed' && $stateParams.feedId) {
    var prevFeedParams = {
          count: 1,
          since_id: $stateParams.feedId
        },
        nextFeedParams = {
          count: 1,
          max_id: parseInt($stateParams.feedId, 10) - 1
        };

    //find the previous feedItem in the feed
    ApiFeed.getFeed(prevFeedParams).then(function(feedResp){
      var feedData = feedResp.data,
          prevItem = feedData[0];

      if(prevItem && prevItem.subject_type==='Morsel' && prevItem.subject) {
        $scope.morsel.prevFeedItem = prevItem;
      }
    }, function(resp){
      if(resp.data && resp.data.errors && resp.data.errors.api) {
        //resp returned an api issue
        //report and error back to user
        Auth.showApiError(resp.status, resp.data.errors);
      }
    });

    //find the next feedItem in the feed
    ApiFeed.getFeed(nextFeedParams).then(function(feedResp){
      var feedData = feedResp.data,
          nextItem = feedData[0];

      if(nextItem && nextItem.subject_type==='Morsel' && nextItem.subject) {
        $scope.morsel.nextFeedItem = nextItem;
      }
    }, function(resp){
      if(resp.data && resp.data.errors && resp.data.errors.api) {
        //resp returned an api issue
        //report and error back to user
        Auth.showApiError(resp.status, resp.data.errors);
      }
    });
  }
});