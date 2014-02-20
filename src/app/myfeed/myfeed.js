angular.module( 'Morsel.myfeed', [
  'ui.state'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'myfeed', {
    url: '/myfeed',
    views: {
      "main": {
        controller: 'MyFeedCtrl',
        templateUrl: 'myfeed/myfeed.tpl.html'
      }
    },
    data:{ pageTitle: 'My Feed' },
    access: {
      restricted : true
    },
    resolve: {
      hasCurrentUser : function(Auth) {
        return Auth.hasCurrentUser();
      }
    }
  });
})

.controller( 'MyFeedCtrl', function MyFeedCtrl( $scope, ApiPosts, Auth) {
  $scope.feed = ApiPosts.getFeed().$object;
  $scope.welcomeUserName = Auth.getCurrentUser().first_name;
});