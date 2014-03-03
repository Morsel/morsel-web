angular.module( 'Morsel.pressKit', [
  'Morsel.morselSwipe'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'pressKit', {
    url: '/presskit',
    views: {
      "main": {
        controller: 'PressKitCtrl',
        templateUrl: 'press-kit/press-kit.tpl.html'
      }
    },
    data:{ pageTitle: 'Press Kit Template' }
  });
})

.controller( 'PressKitCtrl', function PressKitCtrl( $scope, ApiPosts ) {
  $scope.post = {};

  $scope.viewOptions.hideHeader = true;
  $scope.viewOptions.hideFooter = true;

  ApiPosts.getPost('5').then(function(postData){
    $scope.postMorselNumber = 1;

    $scope.post = postData;
  });

  ApiPosts.getPost('1').then(function(postData){
    $scope.post2MorselNumber = 1;

    $scope.post2 = postData;
  });
});