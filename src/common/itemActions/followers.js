angular.module( 'Morsel.common.followers', [] )

//show users who follow something
.directive('mrslFollowers', function(ApiUsers, $modal, $rootScope){
  return {
    scope: {
      followId: '=mrslFollowId',
      followerCount: '=mrslFollowerCount'
    },
    replace: false,
    link: function(scope, element, attrs) {
      scope.showFollowers = function() {
        var modalInstance = $modal.open({
          templateUrl: 'common/user/userList.tpl.html',
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

        $rootScope.$on('$locationChangeSuccess', function () {
          $modalInstance.dismiss('cancel');
        });

        if(!$scope.users) {
          ApiUsers.getFollowers(followId).then(function(followerResp){
            $scope.users = followerResp.data;
          });
        }
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'followId'];
    },
    template: '<a class="h3" ng-click="showFollowers()">{{followerCount}}<span class="h6">Followers</span></a>'
  };
});