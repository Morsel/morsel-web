angular.module('Morsel.common.userList', [])

.directive('mrslUserList', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      users: '=mrslUserList',
      emptyText: '=mrslUserListEmpty',
      userLoadFunc: '=mrslUserListLoadFunc',
      morselTagged: '=mrslUserListTagMorsel',
      blankLinks: '=mrslUserListBlankLinks',
      listLayout: '@mrslUserListLayout',
      view: '@mrslUserListView',
      delayStart: '@mrslUserListViewDelay'
    },
    link: function(scope, element, attrs) {
      scope.listLayoutType = scope.listLayout ? scope.listLayout+'-layout' : '';
    },
    templateUrl: 'common/user/user-list.tpl.html'
  };
});