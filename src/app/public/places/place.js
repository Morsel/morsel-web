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

.controller( 'PlaceCtrl', function PlaceCtrl( $scope, ApiPlaces, PhotoHelpers, MORSELPLACEHOLDER, placeData, currentUser, $state, Auth ) {
  $scope.viewOptions.miniHeader = true;

  $scope.place = placeData;

  //for price display
  $scope.priceRange = _.range(0, $scope.place.information.price_tier);

  //load our morsels immediately (it's the default tab)
  ApiPlaces.getMorsels($scope.place.id).then(function(morselsData) {
    $scope.morsels = morselsData;
  }, function() {
    //if there's an error retrieving morsels, go to 404
    $state.go('404');
  });

  $scope.getPlacePhoto = function() {
    var mapsBaseUrl = 'http://maps.googleapis.com/maps/api/staticmap?maptype=roadmap&format=jpg&zoom=15',
        markersUrl = '&markers=color:green%7C',
        lonOffset= 0.005;

    if($scope.place.lat && $scope.place.lon) {
      return [
        //offset the map a little to the left for mobile
        ['default', mapsBaseUrl+'&center='+$scope.place.lat+','+(parseFloat($scope.place.lon, 10)+lonOffset)+'&size=640x180'+markersUrl+$scope.place.lat+','+$scope.place.lon],
        //640 is biggest size from APi
        ['screen-sm', mapsBaseUrl+'&center='+$scope.place.lat+','+$scope.place.lon+'&size=640x125'+markersUrl+$scope.place.lat+','+$scope.place.lon]
      ];
    } else if($scope.place.address && $scope.place.city && $scope.place.state) {
      return [
        //640 is biggest size from APi
        ['default', mapsBaseUrl+'&center='+encodeURIComponent($scope.place.address+', '+$scope.place.city+', '+$scope.place.state)+'&size=640x180'+markersUrl+encodeURIComponent($scope.place.address+', '+$scope.place.city+', '+$scope.place.state)]
      ];
    } else {
      return [
        ['default', MORSELPLACEHOLDER]
      ];
    }
  };

  $scope.loadPeople = function() {
    if(!$scope.placeUsers) {
      ApiPlaces.getUsers($scope.place.id).then(function(usersResp) {
        $scope.placeUsers = usersResp.data;
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
});