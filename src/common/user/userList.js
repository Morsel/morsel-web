angular.module('Morsel.common.userList', [])

.directive('mrslUserList', function(USER_LIST_NUMBER) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      users: '=mrslUserList',
      emptyText: '=mrslUserListEmpty',
      userLoadFunc: '=mrslUserListLoadFunc',
      morselTagged: '=mrslUserListTagMorsel',
      blankLinks: '=mrslUserListBlankLinks'
    },
    link: function(scope, element, attrs) {
      scope.userIncrement = USER_LIST_NUMBER;
    },
    templateUrl: 'common/user/userList.tpl.html'
  };
});