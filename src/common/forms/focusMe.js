angular.module('Morsel.common.focusMe', [])

.directive('mrslFocusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.mrslFocusMe, function(value) {
        if(value === true) { 
          console.log('value=',value);
          $timeout(function() {
            element[0].focus();
          });
        }
      });
    }
  };
});