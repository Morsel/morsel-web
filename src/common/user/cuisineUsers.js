angular.module( 'Morsel.cuisineUsers', [] )

//show which users are tagged with a certain cuisine
.directive('mrslCuisineUsers', function(ApiKeywords, $modal, $rootScope){
  return {
    scope: {
      cuisine: '=mrslCuisine'
    },
    replace: true,
    link: function(scope, element, attrs) {

      scope.showCuisineUsers = function() {
        var modalInstance = $modal.open({
          templateUrl: 'user/userList.tpl.html',
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

        $rootScope.$on('$locationChangeSuccess', function () {
          $modalInstance.dismiss('cancel');
        });

        if(!$scope.users) {
          ApiKeywords.getCuisineUsers(cuisine.keyword.id).then(function(userData){
            $scope.users = userData;
          });
        }
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'cuisine'];
    },
    template: '<a ng-click="showCuisineUsers()">{{cuisine.keyword.name}}</a>'
  };
});