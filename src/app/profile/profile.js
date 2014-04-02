angular.module( 'Morsel.profile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'profile', {
    url: '/:username',
    views: {
      "main": {
        controller: 'ProfileCtrl',
        templateUrl: 'profile/profile.tpl.html'
      }
    },
    data:{ pageTitle: 'Profile' }
  });
})

.controller( 'ProfileCtrl', function ProfileCtrl( $scope, $stateParams, ApiUsers ) {
  $scope.user = ApiUsers.getUser($stateParams.username).$object;
  //$scope.feed = ApiUsers.getFeed($stateParams.username).$object;
  
  $scope.htmlReady();
});
