angular.module( 'Morsel.restaurant', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'restaurant', {
    url: '/restaurant',
    views: {
      "main": {
        controller: 'RestaurantCtrl',
        templateUrl: 'restaurant/restaurant.tpl.html'
      }
    },
    data:{ pageTitle: 'Sample Restaurant Page' }
  });
})

.controller( 'RestaurantCtrl', function PressKitCtrl( $scope, ApiPosts ) {
  $scope.post = {};

  $scope.viewOptions.hideHeader = true;
  $scope.viewOptions.hideFooter = true;

  //create an array of all morsel swiping on the page. will house directive data
  $scope.morselSwipes = [];
  $scope.morselStyle = {};

  ApiPosts.getPost('5').then(function(postData){
    $scope.postMorselNumber = 1;

    $scope.post = postData;
  });

  ApiPosts.getPost('1').then(function(postData){
    $scope.post2MorselNumber = 1;

    $scope.post2 = postData;
  });

  ApiPosts.getPost('265').then(function(postData){
    $scope.post3MorselNumber = 1;

    $scope.post3 = postData;
  });

  ApiPosts.getPost('268').then(function(postData){
    $scope.post4MorselNumber = 1;

    $scope.post4 = postData;
  });

  ApiPosts.getPost('264').then(function(postData){
    $scope.post5MorselNumber = 1;

    $scope.post5 = postData;
  });

  $scope.test1 =  function(event, delta, deltaX, deltaY){
    console.log('test1');
  };
});