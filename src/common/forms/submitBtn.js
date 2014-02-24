angular.module('Morsel.submitBtn', [])

.directive('submitBtn', [function() {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      form: '=submitBtnForm'
    },
    link: function(scope) {
    },
    templateUrl: 'forms/submitBtn.tpl.html'
  };
}]);