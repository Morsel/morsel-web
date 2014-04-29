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

.controller( 'ProfileCtrl', function ProfileCtrl( $scope, $stateParams, ApiUsers, PhotoHelpers, MORSELPLACEHOLDER, Auth, $window, $location, $anchorScroll, $modal, $rootScope ) {
  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.hideFooter = true;

  $scope.largeBreakpoint = $window.innerWidth > 768; //total hack

  ApiUsers.getUser($stateParams.username).then(function(userData) {
    $scope.user = userData;

    $scope.canEdit = userData.id === Auth.getCurrentUser()['id'];
    $scope.isChef = userData.industry === 'chef';

    ApiUsers.getCuisines(userData.id).then(function(cuisineData) {
      $scope.cuisines = cuisineData;
    });

    ApiUsers.getSpecialties(userData.id).then(function(specialityData) {
      $scope.specialties = specialityData;
    });
  }, function() {
    //if there's an error retrieving user data (bad username?), go to home page for now
    $location.path('/');
  });

  ApiUsers.getMorsels($stateParams.username).then(function(morselsData) {
    $scope.morsels = morselsData;
  }, function() {
    //if there's an error retrieving user data (bad username?), go to home page for now
    $location.path('/');
  });

  $scope.getCoverPhotoArray = function(morsel) {
    var primaryItemPhotos;

    if(morsel.items) {
      primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(morsel);

      if(primaryItemPhotos) {
        return [
          ['default', primaryItemPhotos._100x100],
          ['(min-width: 321px)', primaryItemPhotos._240x240]
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

  $scope.scrollToMorsels = function() {
    $location.hash('user-morsels');
    $anchorScroll();
  };

  $scope.openLikeFeed = function () {
    if($scope.user) {
      var modalInstance = $modal.open({
        templateUrl: 'user/userActivityOverlay.tpl.html',
        controller: ModalInstanceCtrl,
        resolve: {
          user: function () {
            return $scope.user;
          }
        }
      });
    }
  };

  var ModalInstanceCtrl = function ($scope, $modalInstance, user) {
    $scope.user = user;

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $rootScope.$on('$locationChangeSuccess', function () {
      $modalInstance.dismiss('cancel');
    });

    if(!$scope.likeFeed) {
      ApiUsers.getLikeables(user.id, 'Item').then(function(likeableData){
        _.each(likeableData, function(likeable) {
          //construct message to display
          likeable.itemMessage = likeable.morsel.title+(likeable.description ? ': '+likeable.description : '');

          //truncate message
          likeable.itemMessage = likeable.itemMessage.length > 80 ? likeable.itemMessage.substr(0, 80) + '...' : likeable.itemMessage;

          //pick proper photo to display
          likeable.display_photo = likeable.photos ? likeable.photos._80x80 : MORSELPLACEHOLDER;
        });

        $scope.likeFeed = likeableData;
      });
    }
  };
  //we need to implicitly inject dependencies here, otherwise minification will botch them
  ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'user'];
});
