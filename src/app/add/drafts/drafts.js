angular.module( 'Morsel.add.drafts', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'drafts', {
    url: '/add/drafts',
    views: {
      "main": {
        controller: 'DraftsCtrl',
        templateUrl: 'app/add/drafts/drafts.tpl.html'
      }
    },
    data:{ pageTitle: 'Your Drafts' },
    resolve: {
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'DraftsCtrl', function DraftsCtrl( $scope, currentUser ) {
  $scope.viewOptions.miniHeader = true;
});