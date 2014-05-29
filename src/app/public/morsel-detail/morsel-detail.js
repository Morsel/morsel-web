angular.module( 'Morsel.public.morselDetail', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'morselDetail', {
    url: '/:username/{morselDetails:.*}',
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
      }
    }
  });
})

.controller( 'MorselDetailCtrl', function MorselDetailCtrl( $scope, $stateParams, ApiMorsels, ApiUsers, $location, $window, currentUser, $state ) {
  var username = $stateParams.username,
      morselDetailsArr = $stateParams.morselDetails.split('/'),
      morselIdSlug = morselDetailsArr[0];/*,
      itemNumber = parseInt(morselDetailsArr[1], 10);*/

  $scope.viewOptions.miniHeader = true;

  $scope.goHome = function() {
    $window.open($location.protocol() + '://'+ $location.host(), '_self');
  };
  
  //scope vars for individual morsel
  $scope.feedState = {
    inMorsel : false,
    onShare : false
  };

  $scope.updatefeedState = function(obj) {
    _.extend($scope.feedState, obj);
    $scope.$digest();
  };

  //check and make sure we pulled an idslug from the URL
  if(morselIdSlug && username) {
    ApiMorsels.getMorsel(morselIdSlug).then(function(morselData){
      $scope.morsel = morselData;
    }, function() {
      //if there's an error retrieving morsel data (bad id?), go to profile page for now
      $location.path('/'+$stateParams.username);
    });

    ApiUsers.getUser(username).then(function(userResp){
      $scope.owner = userResp.data;
    }, function() {
      //if there's an error retrieving user data (bad username?), go to 404
      $state.go('404');
    });
  } else {
    //if not, send to profile page
    $location.path('/'+$stateParams.username);
  }
});