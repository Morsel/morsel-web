angular.module( 'Morsel.common.followedUsers', [] )

//show whom a user follows
.directive('mrslFollowedUsers', function(ApiUsers, $modal, $rootScope, USER_LIST_NUMBER){
  return {
    scope: {
      followerId: '=mrslFollowerId',
      followingCount: '=mrslFollowingCount'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.showFollowed = function() {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/user/userListOverlay.tpl.html',
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

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.loadUsers = function(endUser) {
          var followablesParams = {
                count: USER_LIST_NUMBER,
                type: 'User'
              };

          if(endUser) {
            followablesParams.before_id = endUser.id;
            followablesParams.before_date = endUser.followed_at;
          }

          ApiUsers.getFollowables(followerId, followablesParams).then(function(followableResp){
            if($scope.users) {
              $scope.users = $scope.users.concat(followableResp.data);
            } else {
              $scope.users = followableResp.data;
            }
          });
        };

        $scope.loadUsers();
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'followerId'];
    },
    template: '<div class="h3" ng-click="showFollowed()">{{followingCount}}<span class="h6">Following</span></div>'
  };
});