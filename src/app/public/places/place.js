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

.controller( 'PlaceCtrl', function PlaceCtrl( $scope, ApiPlaces, MORSELPLACEHOLDER, placeData, currentUser, $state, Auth ) {
  //knock off the protocol so it displays nicer
  if(placeData.information && placeData.information.website_url) {
    placeData.information.website_url_text = placeData.information.website_url.replace(/^.*?:\/\//,'');
  }

  $scope.place = placeData;

  //update page title
  $scope.pageData.pageTitle = $scope.place.name+($scope.place.city ? ', '+$scope.place.city : '')+($scope.place.state ? ', '+$scope.place.state : '')+' Inspirations, Dishes & Drinks | Morsel';

  //for price display
  $scope.priceRange = _.range(0, $scope.place.information.price_tier);

  $scope.getMorsels = function(params) {
    ApiPlaces.getMorsels($scope.place.id, params).then(function(morselsResp) {
      if($scope.morsels) {
        //concat them with new data after old data
        $scope.morsels = $scope.morsels.concat(morselsResp.data);
      } else {
        $scope.morsels = morselsResp.data;
      }
    }, function() {
      //if there's an error retrieving morsels, go to 404
      $state.go('404');
    });
  };

  $scope.getPlacePhoto = function() {
    var mapsBaseUrl = 'https://maps.googleapis.com/maps/api/staticmap?maptype=roadmap&format=jpg&zoom=16',
        markersUrl = '&markers=color:green%7C';

    if($scope.place.lat && $scope.place.lon) {
      return [
        ['default', mapsBaseUrl+'&center='+$scope.place.lat+','+$scope.place.lon+'&size=540x107'+markersUrl+$scope.place.lat+','+$scope.place.lon]
      ];
    } else if($scope.place.address && $scope.place.city && $scope.place.state) {
      return [
        ['default', mapsBaseUrl+'&center='+encodeURIComponent($scope.place.address+', '+$scope.place.city+', '+$scope.place.state)+'&size=540x107'+markersUrl+encodeURIComponent($scope.place.address+', '+$scope.place.city+', '+$scope.place.state)]
      ];
    } else {
      return [
        ['default', MORSELPLACEHOLDER]
      ];
    }
  };

  $scope.loadUsers = function(params) {
    ApiPlaces.getUsers($scope.place.id, params).then(function(usersResp) {
      if($scope.placeUsers) {
        $scope.placeUsers = $scope.placeUsers.concat(usersResp.data);
      } else {
        $scope.placeUsers = usersResp.data;
      }
    });
  };
});
