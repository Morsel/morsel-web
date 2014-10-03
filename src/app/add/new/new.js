angular.module( 'Morsel.add.new', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'add-new', {
    url: '/add',
    views: {
      "main": {
        controller: 'NewMorselCtrl',
        templateUrl: 'app/add/new/new.tpl.html'
      }
    },
    data:{ pageTitle: 'New Morsel' },
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

.controller( 'NewMorselCtrl', function NewMorselCtrl(  ) {

});