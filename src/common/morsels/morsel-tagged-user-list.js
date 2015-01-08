angular.module('Morsel.common.morselTaggedUserList', [])

.directive('mrslTaggedUserList', function($modal, $rootScope, ApiMorsels) {
  return {
    restrict: 'A',
    scope: {
      morsel: '=mrslTaggedUserList'
    },
    link: function(scope, element) {
      scope.showTaggedUsers = function(){
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/user/user-list-overlay.tpl.html',
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
        $scope.view = 'tagged_user_list';

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.loadUsers = function(params) {
          ApiMorsels.getTaggedUsers(morsel.id, params).then(function(usersResp){
            if($scope.users) {
              $scope.users = $scope.users.concat(usersResp.data);
            } else {
              $scope.users = usersResp.data;
            }
          });
        };
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