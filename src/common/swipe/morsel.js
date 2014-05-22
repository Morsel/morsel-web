angular.module('Morsel.common.morsel', [])

.directive('mrslMorsel', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: false,
    templateUrl: 'common/swipe/morsel.tpl.html'
  };
}]);