angular.module( 'Morsel.account.editProfile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'edit-profile', {
    url: '/account/edit-profile',
    views: {
      "main": {
        controller: 'EditProfileCtrl',
        templateUrl: 'editProfile/editProfile.tpl.html'
      }
    },
    data:{
      pageTitle: 'Edit Profile'
    },
    access: {
      /*restricted : true*/
    },
    resolve: {
    }
  });
})

.controller( 'EditProfileCtrl', function EditProfileCtrl( $scope, $stateParams ) {
  $scope.testing = 'this is a test';
});
