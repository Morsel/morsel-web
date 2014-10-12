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

        $scope.searchModel = {
          query: null,
          near: null
        };

        //don't show loader/results until a search has been done
        $scope.hasSearched = false;

        $scope.searchPlaces = function() {
          $scope.hasSearched = true;
          //reset results
          $scope.searchResults = null;

          ApiPlaces.suggestPlaces($scope.searchModel).then(function(resp){
            $scope.searchResults = resp.data.minivenues;
          }, function(resp){
            HandleErrors.onError(resp.data, $scope.placeSearchForm);
          });
        };

        $scope.addPlace = function() {
          PICK UP HERE WITH SAVING THE PLACE YOU ADDED
        };
      };

      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'places', 'ApiPlaces', 'HandleErrors'];
    },
    template: '<div class="add-place-btn"><a ng-click="openAddPlaceOverlay()"><span>&#43;</span> Add Place</a></div>'
  };
});