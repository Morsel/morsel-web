angular.module('Morsel.common.baseErrors', [])

.directive('mrslBaseErrors', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      inForm: '=mrslValForm'
    },
    template: '<div ng-show="inForm.$error.serverErrors" class="alert alert-danger"><p ng-repeat="message in inForm.$error.serverErrors">{{message}}</p></div>'
  };
});
