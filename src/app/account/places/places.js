angular.module( 'Morsel.account.places', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'account.places', {
    url: '/places',
    parent: 'account',
    views: {
      "account-body": {
        controller: 'ManagePlacesCtrl',
        templateUrl: 'app/account/places/places.tpl.html'
      }
    },
    data:{
      pageTitle: 'Manage Places'
    },
    access: {
      restricted : true
    },
    resolve: {
    }
  });
})

.controller( 'ManagePlacesCtrl', function ManagePlacesCtrl( $scope, accountUser, ApiUsers){
  ApiUsers.getPlaces(accountUser.id).then(function(placesResp){
    $scope.places = placesResp.data;
  });
});
