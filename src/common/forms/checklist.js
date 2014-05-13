angular.module('Morsel.common.checklist', [])

.directive('checklist', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
    },
    link: function(scope) {
    },
    templateUrl: 'common/forms/checklist.tpl.html'
  };
}]);