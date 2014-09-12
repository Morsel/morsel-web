angular.module( 'Morsel.common.followers', [] )

//show users who follow something
.directive('mrslFollowers', function(ApiUsers, $modal, $rootScope, USER_LIST_NUMBER){
  return {
    scope: {
      followId: '=mrslFollowId',
      followerCount: '=mrslFollowerCount'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.showFollowers = function() {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/user/userListOverlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            followId: function () {
              return scope.followId;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, followId) {
        $scope.heading = 'Followers';
        $scope.emptyText = 'No one is following this user yet';

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.loadUsers = function(endUser) {
          var followersParams = {
                count: USER_LIST_NUMBER
              };

          if(endUser) {
            followersParams.before_id = endUser.id;
            followersParams.before_date = endUser.followed_at;
          }

          ApiUsers.getFollowers(followId, followersParams).then(function(followerResp){
            if($scope.users) {
              $scope.users = $scope.users.concat(followerResp.data);
            } else {
              $scope.users = followerResp.data;
            }
          });
        };

        $scope.loadUsers();
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'followId'];
    },
    template: '<div class="h3" ng-click="showFollowers()">{{followerCount}}<span class="h6">Followers</span></div>'
  };
});