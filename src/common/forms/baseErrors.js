angular.module('Morsel.baseErrors', [])

.directive('baseErrors', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      inForm: '=valForm'
    },
    template: '<div ng-show="inForm.$error.serverErrors" class="alert alert-danger"><p ng-repeat="message in inForm.$error.serverErrors">{{message}}</p></div>'
  };
});
