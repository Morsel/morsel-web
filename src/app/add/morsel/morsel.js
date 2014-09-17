angular.module( 'Morsel.add.morsel', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'add-morsel', {
    url: '/add/morsel/:morselId',
    views: {
      "main": {
        controller: 'AddMorselCtrl',
        templateUrl: 'app/add/morsel/morsel.tpl.html'
      }
    },
    data:{ pageTitle: 'Morsel Checklist' },
    access: {
      restricted : true
    },
    resolve: {
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'AddMorselCtrl', function AddMorselCtrl( $scope, currentUser, $stateParams, MORSELPLACEHOLDER, ApiMorsels, PhotoHelpers ) {
  $scope.viewOptions.miniHeader = true;

  ApiMorsels.getMorsel($stateParams.morselId).then(function(morselData) {
    $scope.morsel = morselData;
  }, function() {
    //if there's an error retrieving a morsel, go to drafts
    $state.go('drafts');
  });
});