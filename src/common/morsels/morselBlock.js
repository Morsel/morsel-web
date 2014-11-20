angular.module('Morsel.common.morselBlock', [])

.directive('mrslMorselBlock', function(PhotoHelpers, MORSELPLACEHOLDER, $location, $modal, $rootScope, ApiMorsels, USER_LIST_NUMBER) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorselBlock',
      morselFeedItemId: '=mrslMorselBlockFeedItemId',
      spacer: '@mrslMorselBlockSpacer'
    },
    link: function(scope, element) {
      scope.getCoverPhotoArray = function() {
        var primaryItemPhotos,
            $el = element[0],
            needsBigPicture = $el.offsetWidth > 320;

        if(scope.morsel && scope.morsel.items) {
          primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(scope.morsel);

          if(primaryItemPhotos) {
            if(needsBigPicture) {
              return [
                ['default', primaryItemPhotos._640x640]
              ];
            } else {
              return [
                ['default', primaryItemPhotos._320x320]
              ];
            }
          } else {
            var lastItemWithPhotos = PhotoHelpers.findLastItemWithPhotos(scope.morsel.items);

            if(lastItemWithPhotos) {
              if(needsBigPicture) {
                return [
                  ['default', lastItemWithPhotos.photos._640x640]
                ];
              } else {
                return [
                  ['default', lastItemWithPhotos.photos._320x320]
                ];
              }
            } else {
              //no items have photos

              return [
                ['default', MORSELPLACEHOLDER]
              ];
            }
          }
        } else {
          //return blank
          return [];
        }
      };

      scope.showTaggedUsers = function() {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/user/userListOverlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            morsel: function () {
              return scope.morsel;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, morsel) {
        $scope.heading = 'Tagged Users';

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.loadUsers = function(endUser) {
          var userParams = {
                count: USER_LIST_NUMBER,
                type: 'User'
              };

          if(endUser) {
            userParams.max_id = endUser.id;
          }

          ApiMorsels.getTaggedUsers(morsel.id, userParams).then(function(usersResp){
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
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'morsel'];
    },
    templateUrl: 'common/morsels/morselBlock.tpl.html'
  };
});