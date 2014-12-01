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
    resolve: {
      //get the user data of the profile before we try to render the page
      profileUserData: function(ApiUsers, $stateParams, $state) {
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
  })
  .state( 'profile_alias', {
    url: '/users/{userId:[0-9]*}',
    views: {
      "main": {
        controller: 'ProfileCtrl',
        templateUrl: 'app/public/profile/profile.tpl.html'
      }
    },
    resolve: {
      //get the user data of the profile before we try to render the page
      profileUserData: function(ApiUsers, $stateParams, $state) {
        return ApiUsers.getUser($stateParams.userId).then(function(userResp) {
          return userResp.data;
        }, function() {
          //if there's an error retrieving user data (bad id?), send to 404
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

.controller( 'ProfileCtrl', function ProfileCtrl( $scope, ApiUsers, MORSELPLACEHOLDER, profileUserData, currentUser, $state, Auth, MORSEL_LIST_NUMBER ) {
  var name;

  $scope.user = profileUserData;
  $scope.isProfessional = $scope.user.professional;
  $scope.canEdit = $scope.user.id === currentUser.id;

  name = ($scope.user.first_name || $scope.user.last_name) ? $scope.user.first_name+' '+$scope.user.last_name : '';

  //update page title
  $scope.pageData.pageTitle = name+' ('+$scope.user.username+') | Morsel';

  //# of morsels to load at a time
  $scope.morselIncrement = MORSEL_LIST_NUMBER;

  $scope.getMorsels = function(endMorsel) {
    var morselsParams = {
          count: $scope.morselIncrement
        };

    if(endMorsel) {
      morselsParams.before_id = endMorsel.id;
      morselsParams.before_date = endMorsel.published_at;
    }

    ApiUsers.getMorsels($scope.user.id, morselsParams).then(function(morselsData) {
      if($scope.morsels) {
        //concat them with new data after old data, then reverse with a filter
        $scope.morsels = morselsData.concat($scope.morsels);
      } else {
        $scope.morsels = morselsData;
      }
    }, function() {
      //if there's an error retrieving user data (bad username?), go to 404
      $state.go('404');
    });
  };

  //load our morsels immediately (it's the default tab)
  $scope.getMorsels();

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
      ApiUsers.getCuisines($scope.user.id).then(function(cuisineResp) {
        $scope.cuisines = cuisineResp.data;
      });
    }
    
    if(!$scope.specialties) {
      ApiUsers.getSpecialties($scope.user.id).then(function(specialtyResp) {
        $scope.specialties = specialtyResp.data;
      });
    }
  };

  $scope.loadLikeFeed = function() {
    if(!$scope.likeFeed) {
      ApiUsers.getLikeables($scope.user.id, 'Morsel').then(function(likeableResp){
        $scope.likeFeed = likeableResp.data;
      });
    }
  };

  $scope.loadPlaces = function() {
    if(!$scope.userPlaces) {
      ApiUsers.getPlaces($scope.user.id).then(function(placesResp){
        $scope.userPlaces = placesResp.data;
      });
    }
  };
});
