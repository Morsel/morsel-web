angular.module( 'Morsel.common.morselLike', [] )

//like/unlike a morsel
.directive('mrslMorselLike', function(ApiMorsels, AfterLogin, $location, Auth, $q, $window){
  return {
    scope: {
      morsel: '=mrslMorselLike'
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
          if(afterLoginCallback.data && (afterLoginCallback.data.morselId === scope.morsel.id)) {
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

      scope.toggleMorselLike = function() {
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
              morselId: scope.morsel.id
            }
          });

          $window.location.href = '/join';
        }
      };

      function toggleLike() {
        var deferred = $q.defer();

        if(scope.morsel.liked) {
          ApiMorsels.unlikeMorsel(scope.morsel.id).then(function(resp) {
            scope.morsel.liked = resp;
            
            //decrement count for display
            scope.morsel.like_count--;

            deferred.resolve();
          });
        } else {
          ApiMorsels.likeMorsel(scope.morsel.id).then(function(resp) {
            scope.morsel.liked = resp;

            //increment count for display
            scope.morsel.like_count++;

            deferred.resolve();
          });
        }

        return deferred.promise;
      }
    },
    template: '<button ng-click="toggleMorselLike()" class="btn btn-xs btn-link" title="Like morsel"><i ng-class="{\'common-like-filled\': morsel.liked, \'common-like-empty\' : !morsel.liked}"></i></button>'
  };
})

.directive('mrslMorselLikeCount', function(ApiMorsels, $modal, $rootScope, USER_LIST_NUMBER){
  return {
    scope: {
      morsel: '=mrslMorselLikeCount'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.openLikes = function () {
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
        $scope.users = morsel.likers;
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

          ApiMorsels.getLikers(morsel.id, usersParams).then(function(likerResp){
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
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'morsel'];
    },
    template: '<button ng-show="morsel.like_count > 0" ng-click="openLikes()" class="btn btn-link morsel-like-count">{{morsel.like_count}}<span> like{{morsel.like_count===1?\'\':\'s\'}}</span></button>'
  };
});