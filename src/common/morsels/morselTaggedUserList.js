angular.module('Morsel.common.morselTaggedUserList', [])

.directive('mrslTaggedUserList', function($modal, $rootScope, USER_LIST_NUMBER, ApiMorsels) {
  return {
    restrict: 'A',
    scope: {
      morsel: '=mrslTaggedUserList'
    },
    link: function(scope, element) {
      scope.showTaggedUsers = function(){
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/user/userListOverlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            morsel: function () {
              return scope.morsel;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, morsel) {
        $scope.heading = 'Tagged Users';
        $scope.emptyText = 'There are no users tagged';

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.loadUsers = function(endUser) {
          var usersParams = {
                count: USER_LIST_NUMBER
              };

          if(endUser) {
            usersParams.max_id = parseInt(endUser.id, 10) - 1;
          }

          ApiMorsels.getTaggedUsers(morsel.id, usersParams).then(function(usersResp){
            if($scope.users) {
              $scope.users = $scope.users.concat(usersResp.data);
            } else {
              $scope.users = usersResp.data;
            }
          });
        };

        $scope.loadUsers();
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'morsel'];
    },
    template: function(tElement, tAttrs) {
      if(tAttrs.mrslTaggedUserListFull) {
        return '<a ng-bind="morsel.hiddenTaggedUserCount + \' other\'+ (morsel.hiddenTaggedUserCount === 1 ? \'\': \'s\')" ng-click="showTaggedUsers()"></a>';
      } else {
        return '<a ng-bind="\'+ \'+morsel.tagged_users_count" ng-click="showTaggedUsers()"></a>';
      }
    }
  };
});