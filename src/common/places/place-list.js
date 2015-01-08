angular.module('Morsel.common.placeList', [])

.directive('mrslPlaceList', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      places: '=mrslPlaceList',
      emptyText: '=mrslPlaceListEmpty'
    },
    templateUrl: 'common/places/place-list.tpl.html'
  };
}]);