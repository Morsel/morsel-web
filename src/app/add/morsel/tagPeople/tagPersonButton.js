angular.module( 'Morsel.add.tagPersonButton', [] )

.directive('mrslTagPersonBtn', function(ApiMorsels, $q){
  return {
    scope: {
      morselTagged: '=mrslTagPersonBtn',
      personToTag: '=mrslTagPersonBtnUser'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.toggleTagUser = function() {
        var deferred = $q.defer();

        if(scope.personToTag.tagged) {
          ApiMorsels.untagUser(scope.morselTagged.id, scope.personToTag.id).then(function(resp) {
            scope.personToTag.tagged = false;

            //emit this so we can update the tagged people list
            scope.$emit('add.tagPeople.changed');

            deferred.resolve();
          });
        } else {
          ApiMorsels.tagUser(scope.morselTagged.id, scope.personToTag.id).then(function(resp) {
            scope.personToTag.tagged = true;

            //emit this so we can update the tagged people list
            scope.$emit('add.tagPeople.changed');

            deferred.resolve();
          });
        }

        return deferred.promise;
      };
    },
    template: '<button ng-click="toggleTagUser()" class="btn" ng-class="{\'btn-default\' : personToTag.tagged, \'btn-info\' : !personToTag.tagged}" ng-bind="personToTag.tagged ? \'Untag User\' : \'Tag User\'"></button>'
  };
});