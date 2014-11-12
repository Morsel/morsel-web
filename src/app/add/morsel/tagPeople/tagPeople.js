angular.module( 'Morsel.add.tagPeople', [] )

.directive('mrslTagPeople', function(ApiMorsels, $modal, $rootScope, USER_LIST_NUMBER){
  return {
    scope: {
      morsel: '=mrslTagPeople'
    },
    replace: true,
    link: function(scope, element, attrs) {
      //keep track of changed users so we can refresh when we close modal
      scope.morsel.usersUpdated = false;

      function getTaggedUsers() {
        //reset this so it shows loader when it refreshes
        scope.taggedUsers = null;

        ApiMorsels.getTaggedUsers(scope.morsel.id).then(function(usersResp){
          scope.taggedUsers = usersResp.data;
          scope.morsel.usersUpdated = false;
        });
      }

      getTaggedUsers();

      scope.popOverlay = function() {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/user/userListOverlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            morsel: function () {
              return scope.morsel;
            }
          }
        }).result['finally'](function(){
          if(scope.morsel.usersUpdated) {
            getTaggedUsers();
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, morsel) {
        var userParams = {
              count: USER_LIST_NUMBER
            };

        $scope.heading = 'Tag People';
        $scope.emptyText = 'You haven\'t tagged anyone in this morsel';
        $scope.morselTagged = morsel;
        $scope.blankLinks = true;
        $scope.canSearchUsers = true;
        $scope.searchModel = {
          //store our query
          query: '',
          //give access to our search function
          func: _.debounce(searchUsers, 300)
        };

        $scope.$on('add.tagPeople.changed', function(event){
          morsel.usersUpdated = true;
        });

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.loadUsers = function(endUser) {
          if(endUser) {
            userParams.max_id = endUser.id-1;
          } else {
            userParams.max_id = null;
          }

          ApiMorsels.getEligibleTaggedUsers($scope.morselTagged.id, userParams).then(function(userResp){
            if($scope.users) {
              $scope.users = $scope.users.concat(userResp.data);
            } else {
              $scope.users = userResp.data;
            }

            _.defer(function(){$scope.$apply();});
          });
        };

        function searchUsers() {
          //only use search if it's >=3 characters, otherwise show everybody
          if($scope.searchModel.query.length >= 3) {
            $scope.users = null;
            userParams.query = $scope.searchModel.query;
            $scope.loadUsers();
          } else {
            userParams.query = '';
            $scope.users = [];
            $scope.loadUsers();
            _.defer(function(){$scope.$apply();});
          }
        }

        $scope.loadUsers();
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'morsel'];
    },
    templateUrl: 'app/add/morsel/tagPeople/tagPeople.tpl.html'
  };
});