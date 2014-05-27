angular.module('Morsel.common.morsel', [])

.directive('mrslMorsel', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorsel'
    },
    link: function(scope) {
      console.log(scope);
    },
    templateUrl: 'common/swipe/morsel.tpl.html'
  };
}]);