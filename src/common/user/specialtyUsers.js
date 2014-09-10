angular.module( 'Morsel.common.specialtyUsers', [] )

//show which users are tagged with a certain specialty
.directive('mrslSpecialtyUsers', function(ApiKeywords, $modal, $rootScope, USER_LIST_NUMBER){
  return {
    scope: {
      specialty: '=mrslSpecialty'
    },
    replace: false,
    link: function(scope, element, attrs) {

      scope.showSpecialtyUsers = function() {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/user/userListOverlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            specialty: function () {
              return scope.specialty;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, specialty) {
        $scope.heading = specialty.keyword.name;
        $scope.emptyText = 'No one is tagged with this specialty';

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

          ApiKeywords.getSpecialtyUsers(specialty.keyword.id, usersParams).then(function(usersResp){
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
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'specialty'];
    },
    template: '<a ng-click="showSpecialtyUsers()">{{specialty.keyword.name}}</a>'
  };
});