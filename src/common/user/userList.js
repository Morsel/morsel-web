angular.module('Morsel.common.userList', [])

.directive('mrslUserList', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      users: '=mrslUserList'
    },
    templateUrl: 'common/user/userList.tpl.html'
  };
}]);