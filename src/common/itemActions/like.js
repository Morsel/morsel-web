angular.module( 'Morsel.common.itemLike', [] )

//like/unlike an item
.directive('mrslItemLike', function(ApiItems, AfterLogin, $location, Auth, $q, $modal, $rootScope, $window, USER_LIST_NUMBER){
  return {
    scope: {
      item: '=mrslItemLike'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var currentUser,
          isLoggedIn,
          afterLoginCallback;

      Auth.getCurrentUserPromise().then(function(userData) {
        currentUser = userData;
        isLoggedIn = Auth.isLoggedIn();

        //check for an afterlogin callback on load
        if(AfterLogin.hasCallback('like')) {
          afterLoginCallback = AfterLogin.getCallback();

          //make sure it's the right item
          if(afterLoginCallback.data && (afterLoginCallback.data.itemId === scope.item.id)) {
            //make sure we're actually loggeed in just in case
            if(isLoggedIn) {
              toggleLike().then(function(){
                //remove callback after completion
                AfterLogin.removeCallback();
              });
            }
          }
        }
      });

      scope.toggleItemLike = function() {
        //check if we're logged in
        if(isLoggedIn) {
          toggleLike();
        } else {
          var currentUrl = $location.url();

          //if not, set our callback for after we're logged in
          AfterLogin.setCallback({
            type: 'like',
            path: currentUrl,
            data: {
              itemId: scope.item.id
            }
          });

          $window.location.href = '/join';
        }
      };

      function toggleLike() {
        var deferred = $q.defer();

        if(scope.item.liked) {
          ApiItems.unlikeItem(scope.item.id).then(function(resp) {
            scope.item.liked = resp;
            
            //decrement count for display
            scope.item.like_count--;

            deferred.resolve();
          });
        } else {
          ApiItems.likeItem(scope.item.id).then(function(resp) {
            scope.item.liked = resp;

            //increment count for display
            scope.item.like_count++;

            deferred.resolve();
          });
        }

        return deferred.promise;
      }

      scope.openLikes = function () {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/user/userListOverlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            item: function () {
              return scope.item;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, item) {
        $scope.users = item.likers;
        $scope.heading = 'Likers';
        $scope.emptyText = 'No one has liked this yet';

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

          ApiItems.getLikers(item.id, usersParams).then(function(likerResp){
            if($scope.users) {
              $scope.users = $scope.users.concat(likerResp.data);
            } else {
              $scope.users = likerResp.data;
            }
          });
        };

        $scope.loadUsers();
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'item'];
    },
    template: '<div><i ng-click="toggleItemLike()" ng-class="{\'common-like-filled\': item.liked, \'common-like-empty\' : !item.liked}"></i><a ng-show="item.like_count > 0" ng-click="openLikes()">{{item.like_count}}<span> like{{item.like_count===1?\'\':\'s\'}}</span></a></div>'
  };
});