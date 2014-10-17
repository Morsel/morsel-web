angular.module( 'Morsel.common.addPlace', [] )

.directive('mrslAddPlace', function($rootScope, $modal, ApiPlaces, HandleErrors){
  return {
    restrict: 'A',
    scope: {
      places: '=mrslAddPlace'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.openAddPlaceOverlay = function () {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/places/addPlace.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            places: function () {
              return scope.places;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, places, ApiPlaces, HandleErrors) {
        $scope.places = places;

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.searchModel = {
          query: null,
          near: null
        };

        $scope.selectedPlaceModel = {
          title: null
        };

        //obj to store forms so child can access it
        $scope.forms = {};

        //don't show loader/results until a search has been done
        $scope.hasSearched = false;

        $scope.searchPlaces = function() {
          $scope.hasSearched = true;
          //reset results
          $scope.searchResults = null;
          //reset selected place
          $scope.selectedPlace = null;

          ApiPlaces.suggestPlaces($scope.searchModel).then(function(resp){
            $scope.searchResults = resp.data.minivenues;
          }, function(resp){
            HandleErrors.onError(resp.data, $scope.forms.search);
          });
        };

        $scope.selectPlace = function(place) {
          //reset model
          $scope.selectedPlaceModel.title = null;
          //make sure input is reset
          $scope.forms.placeAdd.title.$setValidity('server', true);
          $scope.forms.placeAdd.title.$setPristine();
          
          //remove any errors
          $scope.forms.placeAdd.$error.serverErrors = null;
          $scope.forms.placeAdd.$setPristine();

          $scope.selectedPlace = place;
          //just show the selected place
          $scope.searchResults = [place];
        };

        $scope.addPlace = function() {
          var employmentParams = {
            title: $scope.selectedPlaceModel.title,
            place: {
              foursquare_venue_id: $scope.selectedPlace.id,
              name: $scope.selectedPlace.name
            }
          };

          if($scope.selectedPlace.location.address) {
            employmentParams.place.address = $scope.selectedPlace.location.address;
          }

          if($scope.selectedPlace.location.city) {
            employmentParams.place.city = $scope.selectedPlace.location.city;
          }

          if($scope.selectedPlace.location.state) {
            employmentParams.place.state = $scope.selectedPlace.location.state;
          }

          //show loader
          $scope.addingPlace = true;

          ApiPlaces.employAtPlace($scope.selectedPlace.id, employmentParams).then(function(resp){
            //add it to our list of places
            $scope.places.push(resp.data);

            scope.$emit('places.add.new', resp.data);

            //close overlay
            $scope.cancel();
          }, function(resp){
            $scope.addingPlace = false;
            HandleErrors.onError(resp.data, $scope.forms.placeAdd);
          });
        };
      };

      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'places', 'ApiPlaces', 'HandleErrors'];
    },
    template: '<div class="add-place-btn"><a ng-click="openAddPlaceOverlay()"><span>&#43;</span> Add Place</a></div>'
  };
});