angular.module( 'Morsel.add.tagUserButton', [] )

.directive('mrslTagUserBtn', function(ApiMorsels, $q){
  return {
    scope: {
      morselTagged: '=mrslTagUserBtn',
      userToTag: '=mrslTagUserBtnUser'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.toggleTagUser = function() {
        var deferred = $q.defer();

        if(scope.userToTag.tagged) {
          ApiMorsels.untagUser(scope.morselTagged.id, scope.userToTag.id).then(function(resp) {
            scope.userToTag.tagged = false;

            //emit this so we can update the tagged users list
            scope.$emit('add.tagUsers.changed');

            deferred.resolve();
          });
        } else {
          ApiMorsels.tagUser(scope.morselTagged.id, scope.userToTag.id).then(function(resp) {
            scope.userToTag.tagged = true;

            //emit this so we can update the tagged users list
            scope.$emit('add.tagUsers.changed');

            deferred.resolve();
          });
        }

        return deferred.promise;
      };
    },
    template: '<button ng-click="toggleTagUser()" class="btn" ng-class="{\'btn-default\' : userToTag.tagged, \'btn-info\' : !userToTag.tagged}" ng-bind="userToTag.tagged ? \'Untag User\' : \'Tag User\'"></button>'
  };
});