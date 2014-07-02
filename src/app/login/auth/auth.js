angular.module( 'Morsel.login.auth', [])

.config(function config( $stateProvider ) {
  //set up an abstract state for our main views
  $stateProvider.state( 'auth', {
    abstract: true,
    url: '/auth',
    views: {
      "main": {
        controller: 'AuthCtrl',
        template: '<div ui-view="auth-view"></div>'
      }
    },
    access: {
      restricted : true
    }
  });
})

.controller( 'AuthCtrl', function AuthCtrl ($scope, Auth){
});
