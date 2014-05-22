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
  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.hideFooter = true;

  $scope.goHome = function() {
    $window.open($location.protocol() + '://'+ $location.host(), '_self');
  };
  
  ApiFeed.getFeed().then(function(feedResp) {
    $scope.morsels = [];

    _.each(feedResp.data, function(f) {
      if(f.subject_type==='Morsel') {
        $scope.morsels.push(f.subject);
      }
    });
  }, function(resp){
    console.log('oops, couldnt get feed');
  });
});