angular.module( 'Morsel.followedUsers', [] )

//show whom a user follows
.directive('mrslFollowedUsers', function(ApiUsers, $modal, $rootScope){
  return {
    scope: {
      followerId: '=mrslFollowerId'
    },
    replace: false,
    link: function(scope, element, attrs) {
      //bind whatever our element is to opening the overlay - this way we don't have to replace the existing element
      element.bind('click', showFollowed);

      function showFollowed() {
        var modalInstance = $modal.open({
          templateUrl: 'user/userList.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            followerId: function () {
              return scope.followerId;
            }
          }
        });
      }

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
    }
  };
});