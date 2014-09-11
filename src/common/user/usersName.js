angular.module('Morsel.common.usersName', [])

.directive('mrslUsersName', [function() {
  return {
    restrict: 'A',
    scope: {
      user: '=mrslUsersName'
    },
    link: function(scope, element, attrs) {
      var $el = angular.element(element);

      scope.$watch('user', function(newValue, oldValue) {
        if(newValue && (scope.user.first_name || scope.user.last_name)) {
          scope.first_name = scope.user.first_name;
          scope.last_name = scope.user.last_name;
        } else {
          scope.first_name = 'Morsel';
          scope.last_name = 'User';
          $el.addClass('no-name');
        }
      });
    },
    template: function(tElement, tAttrs) {
      return '{{first_name+\' \'+last_name}}';
    }
  };
}]);