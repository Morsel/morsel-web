angular.module( 'Morsel.account.body', [])

.config(function config( $stateProvider ) {
  //set up an abstract state for our main views
  $stateProvider.state( 'account', {
    abstract: true,
    url: '/account',
    views: {
      "account-body": {
        controller: 'AccountBodyCtrl',
        template: '<div ui-view="main"></div>'
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

.controller( 'AccountBodyCtrl', function AccountBodyCtrl ($scope, accountUser){
});
