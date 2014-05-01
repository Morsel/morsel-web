angular.module( 'Morsel.profile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'profile', {
    url: '/:username',
    views: {
      "main": {
        controller: 'ProfileCtrl',
        templateUrl: 'public/profile/profile.tpl.html'
      }
    },
    data:{ /*pageTitle: 'Profile'*/ },
    resolve: {
      //get our user data before we try to render the page
      userData: function(ApiUsers, $stateParams) {
        return ApiUsers.getUser($stateParams.username).then(function(userData) {
          return userData;
        }, function() {
          //if there's an error retrieving user data (bad username?), go to home page for now
          $location.path('/');
        });
      }
    }
  });
})

.controller( 'ProfileCtrl', function ProfileCtrl( $scope, $stateParams, ApiUsers, PhotoHelpers, MORSELPLACEHOLDER, Auth, $window, $location, $anchorScroll, $modal, $rootScope, userData ) {
  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.hideFooter = true;

  $scope.largeBreakpoint = $window.innerWidth > 768; //total hack

  $scope.user = userData;
  $scope.canEdit = userData.id === Auth.getCurrentUser()['id'];
  $scope.isChef = userData.industry === 'chef';

  ApiUsers.getCuisines(userData.id).then(function(cuisineData) {
    $scope.cuisines = cuisineData;
  });

  ApiUsers.getSpecialties(userData.id).then(function(specialityData) {
    $scope.specialties = specialityData;
  });

  $scope.$on('users.'+$scope.user.id+'.followerCount', function(event, dir){
    if(dir === 'increase') {
      $scope.user.follower_count++;
    } else if (dir === 'decrease') {
      $scope.user.follower_count--;
    }
  });

  //if user isn't a chef, we want to show their like feed in the main section of the profile page
  if(!$scope.isChef) {
    getLikeFeed($scope, $scope.user);
  }

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

  $scope.scrollToLikes = function() {
    $location.hash('user-likes');
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

    getLikeFeed($scope, user);
  };
  //we need to implicitly inject dependencies here, otherwise minification will botch them
  ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'user'];

  function getLikeFeed(scope, user) {
    if(!scope.likeFeed) {
      ApiUsers.getLikeables(user.id, 'Item').then(function(likeableData){
        _.each(likeableData, function(likeable) {
          //construct message to display
          likeable.itemMessage = likeable.morsel.title+(likeable.description ? ': '+likeable.description : '');

          //truncate message
          likeable.itemMessage = likeable.itemMessage.length > 80 ? likeable.itemMessage.substr(0, 80) + '...' : likeable.itemMessage;

          //pick proper photo to display
          likeable.display_photo = likeable.photos ? likeable.photos._80x80 : MORSELPLACEHOLDER;
        });

        scope.likeFeed = likeableData;
      });
    }
  }
});
