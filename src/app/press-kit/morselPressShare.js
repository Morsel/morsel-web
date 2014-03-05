angular.module('Morsel.morselPressShare', [])

.directive('morselPressShare', [function() {
  return {
    restrict: 'EA',
    replace: true,
    scope: true,
    link : function() {
      console.log('here');
    },
    templateUrl: 'press-kit/morselPressShare.tpl.html'
  };
}]);

