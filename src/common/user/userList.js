angular.module('Morsel.common.userList', [])

.directive('mrslUserList', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      users: '=mrslUserList',
      emptyText: '=mrslUserListEmpty'
    },
    templateUrl: 'common/user/userList.tpl.html'
  };
}]);