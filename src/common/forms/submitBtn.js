angular.module('Morsel.submitBtn', [])

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
    templateUrl: 'forms/submitBtn.tpl.html'
  };
}]);