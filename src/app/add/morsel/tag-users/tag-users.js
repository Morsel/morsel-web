angular.module( 'Morsel.add.tagUsers', [] )

.directive('mrslTagUsers', function(ApiMorsels, $modal, $rootScope, USER_LIST_NUMBER){
  return {
    scope: {
      morsel: '=mrslTagUsers'
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
          templateUrl: 'common/user/user-list-overlay.tpl.html',
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
        $scope.heading = 'Tag Users';
        $scope.emptyText = 'You haven\'t tagged anyone in this morsel';
        $scope.view = 'add_tagged_users_list';
        $scope.morselTagged = morsel;
        $scope.blankLinks = true;
        $scope.canSearchUsers = true;
        $scope.searchModel = {
          //store our query
          query: '',
          //give access to our search function
          func: _.debounce(searchUsers, 300)
        };

        $scope.$on('add.tagUsers.changed', function(event){
          morsel.usersUpdated = true;
        });

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.loadUsers = function(params) {
          if(!params) {
            params = {
              count: USER_LIST_NUMBER,
              page: 1
            };
          }

          if(_.isUndefined(params.query)) {
            params.query = $scope.searchModel.query;
          }

          ApiMorsels.getEligibleTaggedUsers($scope.morselTagged.id, params).then(function(userResp){
            if($scope.users) {
              $scope.users = $scope.users.concat(userResp.data);
            } else {
              $scope.users = userResp.data;
            }

            _.defer(function(){$scope.$apply();});
          });
        };

        function searchUsers() {
          $scope.users = null;
          //only use search if it's >=3 characters, otherwise show everybody
          if($scope.searchModel.query.length >= 3) {
            $scope.loadUsers();
          } else {
            $scope.loadUsers({
              count: USER_LIST_NUMBER,
              page: 1,
              query: ''
            });
          }
        }
      };
    },
    templateUrl: 'app/add/morsel/tag-users/tag-users.tpl.html'
  };
});