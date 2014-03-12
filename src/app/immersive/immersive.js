angular.module( 'Morsel.immersive', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'immersive', {
    url: '/immersive',
    views: {
      "main": {
        controller: 'ImmersiveCtrl',
        templateUrl: 'immersive/immersive.tpl.html'
      }
    },
    data:{ pageTitle: 'Sample Immersive Page' }
  });
})

.controller( 'ImmersiveCtrl', function ImmersiveCtrl( $scope, ApiPosts ) {
  $scope.post = {};

  $scope.viewOptions.hideHeader = true;
  $scope.viewOptions.hideFooter = true;

});