angular.module( 'Morsel.common.cuisineUsers', [] )

//show which users are tagged with a certain cuisine
.directive('mrslCuisineUsers', function(ApiKeywords, $modal, $rootScope, USER_LIST_NUMBER){
  return {
    scope: {
      cuisine: '=mrslCuisine'
    },
    replace: true,
    link: function(scope, element, attrs) {

      scope.showCuisineUsers = function() {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/user/userListOverlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            cuisine: function () {
              return scope.cuisine;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, cuisine) {
        $scope.heading = cuisine.keyword.name;
        $scope.emptyText = 'No one is tagged with this type of cuisine';

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

          ApiKeywords.getCuisineUsers(cuisine.keyword.id, usersParams).then(function(usersResp){
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
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'cuisine'];
    },
    template: '<a ng-click="showCuisineUsers()">{{cuisine.keyword.name}}</a>'
  };
});