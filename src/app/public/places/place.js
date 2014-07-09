angular.module( 'Morsel.public.place', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'place', {
    url: '/places/:placeIdSlug',
    views: {
      "main": {
        controller: 'PlaceCtrl',
        templateUrl: 'app/public/places/place.tpl.html'
      }
    },
    data:{ /*pageTitle: 'Profile'*/ },
    resolve: {
      //get the place data of the before we try to render the page
      placeData: function(ApiPlaces, $stateParams, $state) {
        return ApiPlaces.getPlace($stateParams.placeIdSlug).then(function(placeResp) {
          return placeResp.data;
        }, function() {
          //if there's an error retrieving place data (bad slug?), send to 404
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

.controller( 'PlaceCtrl', function PlaceCtrl( $scope, ApiUsers, PhotoHelpers, MORSELPLACEHOLDER, placeData, currentUser, $state, Auth ) {
  $scope.viewOptions.miniHeader = true;

  $scope.place = placeData;
  console.log(placeData);

  /*$scope.loadLikeFeed = loadLikeFeed;

  //load our morsels immediately (it's the default tab)
  ApiUsers.getMorsels($scope.user.username).then(function(morselsData) {
    $scope.morsels = morselsData;
  }, function() {
    //if there's an error retrieving user data (bad username?), go to 404
    $state.go('404');
  });

  $scope.$on('users.'+$scope.user.id+'.followerCount', function(event, dir){
    if(dir === 'increase') {
      $scope.user.follower_count++;
    } else if (dir === 'decrease') {
      $scope.user.follower_count--;
    }
  });

  $scope.getUserPhoto = function() {
    if($scope.user.photos) {
      return [
        ['default', $scope.user.photos._80x80],
        ['screen-md', $scope.user.photos._144x144]
      ];
    } else {
      return [
        ['default', MORSELPLACEHOLDER]
      ];
    }
  };

  $scope.loadTags = function() {
    if(!$scope.cuisines) {
      ApiUsers.getCuisines(profileUserData.id).then(function(cuisineResp) {
        $scope.cuisines = cuisineResp.data;
      });
    }
    
    if(!$scope.specialties) {
      ApiUsers.getSpecialties(profileUserData.id).then(function(specialtyResp) {
        $scope.specialties = specialtyResp.data;
      });
    }
  };

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

  function loadLikeFeed() {
    if(!$scope.likeFeed) {
      ApiUsers.getLikeables($scope.user.id, 'Item').then(function(likeableResp){
        $scope.likeFeed = likeableResp.data;
      });
    }
  }*/
});
