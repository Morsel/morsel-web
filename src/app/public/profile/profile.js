angular.module( 'Morsel.public.profile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'profile', {
    url: '/{username:[a-zA-Z][A-Za-z0-9_]{0,14}}',
    views: {
      "main": {
        controller: 'ProfileCtrl',
        templateUrl: 'app/public/profile/profile.tpl.html'
      }
    },
    data:{ /*pageTitle: 'Profile'*/ },
    resolve: {
      //get the user data of the profile before we try to render the page
      profileUserData: function(ApiUsers, $stateParams, $location, $state) {
        return ApiUsers.getUser($stateParams.username).then(function(userResp) {
          return userResp.data;
        }, function() {
          //if there's an error retrieving user data (bad username?), send to 404
          $state.go('404');
        });
      },
      //get current user data before displaying so we don't run into odd situations of trying to perform user actions before user is loaded
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'ProfileCtrl', function ProfileCtrl( $scope, $stateParams, ApiUsers, PhotoHelpers, MORSELPLACEHOLDER, $window, $location, $anchorScroll, $modal, $rootScope, profileUserData, currentUser, $state ) {
  $scope.viewOptions.miniHeader = true;

  $scope.largeBreakpoint = $window.innerWidth > 768; //total hack

  $scope.user = profileUserData;
  $scope.isChef = profileUserData.industry === 'chef';

  $scope.canEdit = profileUserData.id === currentUser.id;

  ApiUsers.getCuisines(profileUserData.id).then(function(cuisineResp) {
    $scope.cuisines = cuisineResp.data;
  });

  ApiUsers.getSpecialties(profileUserData.id).then(function(specialtyResp) {
    $scope.specialties = specialtyResp.data;
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

  ApiUsers.getMorsels($scope.user.username).then(function(morselsData) {
    $scope.morsels = morselsData;
  }, function() {
    //if there's an error retrieving user data (bad username?), go to 404
    $state.go('404');
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
        templateUrl: 'common/user/userActivityOverlay.tpl.html',
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
      ApiUsers.getLikeables(user.id, 'Item').then(function(likeableResp){
        _.each(likeableResp.data, function(likeable) {
          //construct message to display
          likeable.itemMessage = likeable.morsel.title+(likeable.description ? ': '+likeable.description : '');

          //truncate message
          likeable.itemMessage = likeable.itemMessage.length > 80 ? likeable.itemMessage.substr(0, 80) + '...' : likeable.itemMessage;

          //pick proper photo to display
          likeable.display_photo = likeable.photos ? likeable.photos._80x80 : MORSELPLACEHOLDER;
        });

        scope.likeFeed = likeableResp.data;
      });
    }
  }
});
