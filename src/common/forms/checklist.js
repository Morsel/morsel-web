angular.module('Morsel.common.checklist', [])

.directive('mrslChecklist', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      /* needs to be of form: {
       * name: ____,
       * isChecked: ____,
       * <anything else>: ____
       * }
       */
      checklist: '=mrslChecklistVals',
      changeFunc: '=mrslChecklistChange'
    },
    templateUrl: 'common/forms/checklist.tpl.html'
  };
}]);