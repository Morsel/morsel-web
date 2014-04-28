angular.module('Morsel.checklist', [])

.directive('checklist', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
    },
    link: function(scope) {
    },
    templateUrl: 'forms/checklist.tpl.html'
  };
}]);