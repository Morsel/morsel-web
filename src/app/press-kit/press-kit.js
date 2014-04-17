angular.module( 'Morsel.pressKit', [])

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

.controller( 'PressKitCtrl', function PressKitCtrl( $scope, ApiMorsels ) {
  $scope.post = {};

  $scope.viewOptions.hideHeader = true;
  $scope.viewOptions.hideFooter = true;

  //create an array of all morsel swiping on the page. will house directive data
  $scope.morselSwipes = [];

  ApiMorsels.getMorsel('5').then(function(postData){
    $scope.postMorselNumber = 1;

    $scope.post = postData;
  });

  ApiMorsels.getMorsel('1').then(function(postData){
    $scope.post2MorselNumber = 1;

    $scope.post2 = postData;
  });

  ApiMorsels.getMorsel('265').then(function(postData){
    $scope.post3MorselNumber = 1;

    $scope.post3 = postData;
  });

  ApiMorsels.getMorsel('268').then(function(postData){
    $scope.post4MorselNumber = 1;

    $scope.post4 = postData;
  });

  ApiMorsels.getMorsel('264').then(function(postData){
    $scope.post5MorselNumber = 1;

    $scope.post5 = postData;
  });
});