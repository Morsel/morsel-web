angular.module( 'Morsel.common.followedUsers', [] )

//show whom a user follows
.directive('mrslFollowedUsers', function(ApiUsers, $modal, $rootScope){
  return {
    scope: {
      followerId: '=mrslFollowerId',
      followingCount: '=mrslFollowingCount'
    },
    replace: false,
    link: function(scope, element, attrs) {
      scope.showFollowed = function() {
        var modalInstance = $modal.open({
          templateUrl: 'common/user/userList.tpl.html',
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

        $rootScope.$on('$locationChangeSuccess', function () {
          $modalInstance.dismiss('cancel');
        });

        if(!$scope.users) {
          ApiUsers.getFollowables(followerId, 'User').then(function(followedData){
            $scope.users = followedData;
          });
        }
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'followerId'];
    },
    template: '<a class="h3" ng-click="showFollowed()">{{followingCount}}<span class="h6">Following</span></a>'
  };
});