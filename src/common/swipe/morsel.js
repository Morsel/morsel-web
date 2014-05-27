angular.module('Morsel.common.morsel', [])

.directive('mrslMorsel', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorsel'
    },
    templateUrl: 'common/swipe/morsel.tpl.html'
  };
}]);