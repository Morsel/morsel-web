angular.module( 'Morsel.common.itemLike', [] )

//like/unlike an item
.directive('mrslItemLike', function(ApiItems, AfterLogin, $location, Auth, $q, $modal, $rootScope){
  return {
    scope: {
      item: '=mrslItemLike'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var isLoggedIn;

      Auth.getCurrentUserPromise().then(function(userData) {
        currentUser = userData;
        isLoggedIn = Auth.isLoggedIn();
      });

      scope.toggleItemLike = function() {
        //check if we're logged in
        if(isLoggedIn) {
          toggleLike();
        } else {
          var currentUrl = $location.url();

          //if not, set our callback for after we're logged in
          AfterLogin.addCallbacks(function() {
            toggleLike().then(function(){
              $location.path(currentUrl);
            });
          });
          $location.path('/join');
        }
      };

      function toggleLike() {
        var deferred = $q.defer();

        if(scope.item.liked) {
          ApiItems.unlikeItem(scope.item.id).then(function(resp) {
            scope.item.liked = resp.data;

            //remove user from liker list
            if(scope.item.likers) {
              scope.item.likers = _.reject(scope.item.likers, function(liker) {
                return liker.id === currentUser.id;
              });
            }
            
            //increment count for display
            scope.item.like_count--;

            deferred.resolve();
          });
        } else {
          ApiItems.likeItem(scope.item.id).then(function(resp) {
            scope.item.liked = resp.data;

            //add user to liker list
            if(scope.item.likers) {
              scope.item.likers.unshift(currentUser);
            } else {
              scope.item.likers = [currentUser];
            }

            //decrement count for display
            scope.item.like_count++;

            deferred.resolve();
          });
        }

        return deferred.promise;
      }

      scope.openLikes = function () {
        var modalInstance = $modal.open({
          templateUrl: 'common/user/userList.tpl.html',
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

        $rootScope.$on('$locationChangeSuccess', function () {
          $modalInstance.dismiss('cancel');
        });

        if(!$scope.users) {
          ApiItems.getLikers(item.id).then(function(likerResp){
            $scope.users = likerResp.data;
          });
        }
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'item'];
    },
    template: '<a><i ng-click="toggleItemLike()" class="{{item.liked ? \'common-like\' : \'common-like-empty\'}}"></i><span ng-click="openLikes()">{{item.like_count}} like{{item.like_count===1?\'\':\'s\'}}</span></a>'
  };
});