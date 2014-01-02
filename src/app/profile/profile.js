angular.module( 'Morsel.profile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'profile', {
    url: '/profile',
    views: {
      "main": {
        controller: 'ProfileCtrl',
        templateUrl: 'profile/profile.tpl.html'
      }
    },
    data:{ pageTitle: 'Profile' }
  });
})

.controller( 'ProfileCtrl', function ProfileCtrl( $scope ) {
});
