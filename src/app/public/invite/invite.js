angular.module( 'Morsel.public.invite', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'invite', {
    url: '/invite',
    views: {
      "main": {
        controller: 'InviteCtrl',
        template: '<div></div>'
      }
    },
    data:{ pageTitle: 'Invited' },
    resolve: {
      //redirect immediately
      redirectToHome: function($location) {
        //could put a mixpanel event here eventually

        //remove query
        $location.url($location.path());
        $location.path('');
      }
    }
  });
})

.controller( 'InviteCtrl', function InviteCtrl() {
});