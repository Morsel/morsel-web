angular.module( 'Morsel.account.body', [])

.config(function config( $stateProvider ) {
  //set up an abstract state for our main views
  $stateProvider.state( 'account', {
    abstract: true,
    url: '/account',
    views: {
      "main": {
        controller: 'AccountBodyCtrl',
        templateUrl: 'app/account/accountBody/account-body.tpl.html'
      }
    },
    access: {
      restricted : true
    },
    resolve: {
      //make sure we resolve a user before displaying
      accountUser:  function(Auth){
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'AccountBodyCtrl', function AccountBodyCtrl ($scope, accountUser, Auth){
  $scope.isProfessional = Auth.isProfessional();
});
