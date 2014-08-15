angular.module('Morsel.common.checklist', [])

.directive('mrslChecklist', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      /* a 2d array of items of form: {
       * name: ____,
       * isChecked: ____,
       * <anything else>: ____
       * }
       */
      checklist: '=mrslChecklistVals',
      changeFunc: '=mrslChecklistChange'
    },
    link: function(scope, element, attrs) {
      scope.colWidths = '';

      scope.$watch('checklist', function(newValue, oldValue) {
        if(newValue) {
          scope.colWidths = 'col-lg-'+Math.floor(12/scope.checklist.length);
        }
      });
    },
    templateUrl: 'common/forms/checklist.tpl.html'
  };
}]);