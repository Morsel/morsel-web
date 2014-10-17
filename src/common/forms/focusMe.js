angular.module('Morsel.common.focusMe', [])

.directive('mrslFocusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.mrslFocusMe, function(value) {
        if(value === true) { 
          $timeout(function() {
            element[0].focus();
          });
        }
      });
    }
  };
});