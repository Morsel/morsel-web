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

.controller( 'ProfileCtrl', function ProfileCtrl( $scope, $stateParams, ApiUsers, PageData ) {
  $scope.user = ApiUsers.getUser($stateParams.username).$object;
  $scope.feed = ApiUsers.getFeed($stateParams.username).$object;

  PageData.setTitle('testing profile page title');
  PageData.setDescription('testing a description');
  $scope.htmlReady();
});
