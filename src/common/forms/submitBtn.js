angular.module('Morsel.common.submitBtn', [])

.directive('mrslSubmitBtn', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      form: '=mrslSubmitBtnForm',
      copy: '@mrslSubmitBtnCopy'
    },
    link: function(scope) {
    },
    templateUrl: 'common/forms/submitBtn.tpl.html'
  };
}]);