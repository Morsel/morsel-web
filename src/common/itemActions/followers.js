angular.module( 'Morsel.followers', [] )

//show users who follow something
.directive('mrslFollowers', function(ApiUsers, $modal, $rootScope){
  return {
    scope: {
      followId: '=mrslFollowId'
    },
    replace: false,
    link: function(scope, element, attrs) {
      //bind whatever our element is to opening the overlay - this way we don't have to replace the existing element
      element.bind('click', showFollowers);

      function showFollowers() {
        var modalInstance = $modal.open({
          templateUrl: 'user/userList.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            followId: function () {
              return scope.followId;
            }
          }
        });
      }

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
          ApiUsers.getFollowers(followId).then(function(followerData){
            $scope.users = followerData;
          });
        }
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'followId'];
    }
  };
});