angular.module( 'Morsel.addMorsel', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'add-morsel', {
    url: '/add-morsel',
    views: {
      "main": {
        controller: 'AddMorselCtrl',
        templateUrl: 'add-morsel/add-morsel.tpl.html'
      }
    },
    data:{ pageTitle: 'Add Morsel' },
    access: {
      restricted : true
    },
    resolve: {
      loggedInUser : 'userData'
    }
  });
})

.controller( 'AddMorselCtrl', function AddMorselCtrl( $scope) {
  
});
