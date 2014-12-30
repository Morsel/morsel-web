angular.module( 'Morsel.public.profile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'profile', {
    abstract: true,
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
  .state('profile.morsels', {
    url: '',
    views: {
      "morsels-tab": {
        controller: 'ProfileMorselsCtrl',
        templateUrl: 'app/public/profile/morsels.tpl.html'
      }
    },
    sticky: true
  }).state('profile.collections', {
    url: '/collections',
    views: {
      "collections-tab": {
        controller: 'ProfileCollectionsCtrl',
        templateUrl: 'app/public/profile/collections.tpl.html'
      }
    },
    sticky: true
  }).state('profile.places', {
    url: '/places',
    views: {
      "places-tab": {
        controller: 'ProfilePlacesCtrl',
        templateUrl: 'app/public/profile/places.tpl.html'
      }
    },
    sticky: true
  }).state('profile.likes', {
    url: '/likes',
    views: {
      "likes-tab": {
        controller: 'ProfileLikesCtrl',
        templateUrl: 'app/public/profile/likes.tpl.html'
      }
    },
    sticky: true
  });
})

.controller( 'ProfileCtrl', function ProfileCtrl( $scope, ApiUsers, MORSELPLACEHOLDER, profileUserData, currentUser, $state, Auth ) {
  $scope.user = profileUserData;
  $scope.isProfessional = $scope.user.professional;
  $scope.currentUser = currentUser;
  $scope.canEdit = $scope.user.id === currentUser.id;
  $scope.$state = $state;

  $scope.formattedName = ($scope.user.first_name || $scope.user.last_name) ? $scope.user.first_name+' '+$scope.user.last_name : '';

  //update page title
  $scope.pageData.pageTitle = $scope.formattedName+' ('+$scope.user.username+') | Morsel';

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
})

.controller( 'ProfileMorselsCtrl', function ProfileMorselsCtrl( $scope, ApiUsers, $state) {
  //update page title
  $scope.pageData.pageTitle = $scope.formattedName+' ('+$scope.user.username+') | Morsel';

  $scope.getMorsels = function(params) {
    ApiUsers.getMorsels($scope.user.id, params).then(function(morselsData) {
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
})

.controller( 'ProfileCollectionsCtrl', function ProfileCollectionsCtrl( $scope, ApiUsers, COLLECTIONS_LIST_NUMBER, $timeout) {
  //update page title
  $scope.pageData.pageTitle = $scope.formattedName+' ('+$scope.user.username+') - Collections | Morsel';

  //since we have the "create new collection" button, load one less the first time so it fits nicely
  $scope.collectionsIncrement = COLLECTIONS_LIST_NUMBER - 1;

  $scope.loadCollections = function(params) {
    ApiUsers.getCollections($scope.user.id, params).then(function(collectionsResp){
      if($scope.userCollections) {
        //concat them with new data after old data
        $scope.userCollections = $scope.userCollections.concat(collectionsResp.data);
      } else {
        $scope.userCollections = collectionsResp.data;

        $timeout(function() {
          //update our increment to get the full count next time after storing data
          $scope.collectionsIncrement = COLLECTIONS_LIST_NUMBER;
        }, 0);
      }
    });
  };
})

.controller( 'ProfilePlacesCtrl', function ProfilePlacesCtrl( $scope, ApiUsers) {
  //update page title
  $scope.pageData.pageTitle = $scope.formattedName+' ('+$scope.user.username+') - Places | Morsel';

  $scope.loadPlaces = function() {
    if(!$scope.userPlaces) {
      ApiUsers.getPlaces($scope.user.id).then(function(placesResp){
        $scope.userPlaces = placesResp.data;
      });
    }
  };

  $scope.loadPlaces();
})

.controller( 'ProfileLikesCtrl', function ProfileLikesCtrl( $scope, ApiUsers) {
  //update page title
  $scope.pageData.pageTitle = $scope.formattedName+' ('+$scope.user.username+') - Likes | Morsel';

  $scope.loadLikeFeed = function() {
    if(!$scope.likeFeed) {
      ApiUsers.getLikeables($scope.user.id, 'Morsel').then(function(likeableResp){
        $scope.likeFeed = likeableResp.data;
      });
    }
  };

  $scope.loadLikeFeed();
});