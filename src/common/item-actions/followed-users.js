angular.module( 'Morsel.common.followedUsers', [] )

//show whom a user follows
.directive('mrslFollowedUsers', function(ApiUsers, $modal, $rootScope){
  return {
    scope: {
      followerId: '=mrslFollowerId',
      followingCount: '=mrslFollowingCount'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.showFollowed = function() {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/user/user-list-overlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            followerId: function () {
              return scope.followerId;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, followerId) {
        $scope.heading = 'Following';
        $scope.emptyText = 'This user isn\'t following anyone yet';
        $scope.view = 'following_list';

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.loadUsers = function(params) {
          params.type = 'User';

          ApiUsers.getFollowables(followerId, params).then(function(followableResp){
            if($scope.users) {
              $scope.users = $scope.users.concat(followableResp.data);
            } else {
              $scope.users = followableResp.data;
            }
          });
        };
      };
    },
    template: '<div class="h3" ng-click="showFollowed()">{{followingCount}}<span class="h6">Following</span></div>'
  };
});