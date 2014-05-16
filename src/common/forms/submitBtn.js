angular.module('Morsel.common.submitBtn', [])

.directive('mrslSubmitBtn', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      form: '=mrslSubmitBtnForm',
      copy: '@mrslSubmitBtnCopy',
      btnBlock: '@mrslSubmitBtnBlock',
      tooltipPlacement: '@mrslSubmitBtnTooltipPlacement'
    },
    link: function(scope) {
    },
    templateUrl: 'common/forms/submitBtn.tpl.html'
  };
}]);