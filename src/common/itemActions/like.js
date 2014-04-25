angular.module( 'Morsel.itemLike', [] )

//like/unlike an item
.directive('mrslItemLike', function(ApiItems, AfterLogin, $location, Auth, $q, $modal, $rootScope){
  return {
    scope: {
      item: '=mrslItemLike'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.toggleItemLike = function() {
        //check if we're logged in
        if(Auth.isLoggedIn()) {
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
          ApiItems.unlikeItem(scope.item.id).then(function(data) {
            scope.item.liked = data;

            //remove user from liker list
            if(scope.item.likers) {
              scope.item.likers = _.reject(scope.item.likers, function(liker) {
                return liker.id === Auth.getCurrentUser()['id'];
              });
            }
            
            //increment count for display
            scope.item.like_count--;

            deferred.resolve();
          });
        } else {
          ApiItems.likeItem(scope.item.id).then(function(data) {
            scope.item.liked = data;

            //add user to liker list
            if(scope.item.likers) {
              scope.item.likers.unshift(Auth.getCurrentUser());
            } else {
              scope.item.likers = [Auth.getCurrentUser()];
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
          templateUrl: 'user/userList.tpl.html',
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

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $rootScope.$on('$locationChangeSuccess', function () {
          $modalInstance.dismiss('cancel');
        });

        if(!$scope.users) {
          ApiItems.getLikers(item.id).then(function(likerData){
            $scope.users = likerData;
          });
        }
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'item'];
    },
    template: '<a><i ng-click="toggleItemLike()" class="{{item.liked ? \'common-like\' : \'common-like-empty\'}}"></i><span ng-click="openLikes()">{{item.like_count}} like{{item.like_count===1?\'\':\'s\'}}</span></a>'
  };
});