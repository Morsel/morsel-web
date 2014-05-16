angular.module( 'Morsel.common.specialtyUsers', [] )

//show which users are tagged with a certain specialty
.directive('mrslSpecialtyUsers', function(ApiKeywords, $modal, $rootScope){
  return {
    scope: {
      specialty: '=mrslSpecialty'
    },
    replace: false,
    link: function(scope, element, attrs) {

      scope.showSpecialtyUsers = function() {
        var modalInstance = $modal.open({
          templateUrl: 'common/user/userList.tpl.html',
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

        $rootScope.$on('$locationChangeSuccess', function () {
          $modalInstance.dismiss('cancel');
        });

        if(!$scope.users) {
          ApiKeywords.getSpecialtyUsers(specialty.keyword.id).then(function(userResp){
            $scope.users = userResp.data;
          });
        }
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'specialty'];
    },
    template: '<a ng-click="showSpecialtyUsers()">{{specialty.keyword.name}}</a>'
  };
});