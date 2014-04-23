angular.module( 'Morsel.profile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'profile', {
    url: '/:username',
    views: {
      "main": {
        controller: 'ProfileCtrl',
        templateUrl: 'profile/profile.tpl.html'
      }
    },
    data:{ /*pageTitle: 'Profile'*/ }
  });
})

.controller( 'ProfileCtrl', function ProfileCtrl( $scope, $stateParams, ApiUsers, PhotoHelpers, MORSELPLACEHOLDER ) {
  $scope.viewOptions.hideFooter = true;
  
  ApiUsers.getUser($stateParams.username).then(function(userData) {
    $scope.user = userData;
  }, function() {
    console.log('error retrieving user data');
  });

  ApiUsers.getMorsels($stateParams.username).then(function(morselsData) {
    $scope.morsels = morselsData;
  }, function() {
    console.log('error retrieving morsels');
  });

  $scope.getCoverPhotoArray = function(morsel) {
    var primaryItemPhotos;

    if(morsel.items) {
      primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(morsel);

      if(primaryItemPhotos) {
        return [
          ['default', primaryItemPhotos._320x320],
          ['(min-width: 321px)', primaryItemPhotos._480x480],
          ['screen-xs', primaryItemPhotos._640x640],
          ['(min-width: 640px)', primaryItemPhotos._992x992]
        ];
      } else {
        return [
          ['default', MORSELPLACEHOLDER]
        ];
      }
    } else {
      //return blank
      return [];
    }
  };
});
