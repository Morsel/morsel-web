angular.module( 'Morsel.common.addPlace', [] )

.directive('mrslAddPlace', function($rootScope, $modal){
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

      var ModalInstanceCtrl = function ($scope, $modalInstance, places) {
        $scope.places = places;
      };

      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'places'];
    },
    template: '<div class="add-place-btn"><a ng-click="openAddPlaceOverlay()"><span>&#43;</span> Add Place</a></div>'
  };
});