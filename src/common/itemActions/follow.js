angular.module( 'Morsel.follow', [] )

//follow/unfollow something
.directive('mrslFollow', function(ApiUsers, AfterLogin, $location, Auth, $q){
  return {
    scope: {
      idToFollow: '=mrslIdToFollow',
      isFollowing: '=mrslIsFollowing'
    },
    replace: true,
    link: function(scope, element, attrs) {
      //wait until we have the data on who to follow, then decide if we need to show the follow button or not
      scope.$watch('idToFollow', function(newValue, oldValue) {
        if(newValue) {
          var currentUser = Auth.getCurrentUser();

          if(currentUser && currentUser.id === scope.idToFollow) {
            scope.isSelf = true;
          }
        }
      });

      scope.toggleFollow = function() {
        //check if we're logged in
        if(Auth.isLoggedIn()) {
          performToggleFollow();
        } else {
          var currentUrl = $location.url();

          //if not, set our callback for after we're logged in
          AfterLogin.addCallbacks(function() {
            performToggleFollow().then(function(){
              $location.path(currentUrl);
            });
          });
          $location.path('/join');
        }
      };

      function performToggleFollow() {
        var deferred = $q.defer();

        if(scope.isFollowing) {
          ApiUsers.unfollowUser(scope.idToFollow).then(function(data) {
            scope.isFollowing = false;

            //don't worry about this for now
            /*//remove user from liker list
            if(scope.item.likers) {
              scope.item.likers = _.reject(scope.item.likers, function(liker) {
                return liker.id === Auth.getCurrentUser()['id'];
              });
            }
            
            //increment count for display
            scope.item.like_count--;*/

            deferred.resolve();
          });
        } else {
          ApiUsers.followUser(scope.idToFollow).then(function(data) {
            scope.isFollowing = true;

            //don't worry about this for now
            /*//add user to liker list
            if(scope.item.likers) {
              scope.item.likers.unshift(Auth.getCurrentUser());
            } else {
              scope.item.likers = [Auth.getCurrentUser()];
            }

            //decrement count for display
            scope.item.like_count++;*/

            deferred.resolve();
          });
        }

        return deferred.promise;
      }
    },
    template: '<button ng-hide="isSelf" ng-click="toggleFollow()" class="btn {{isFollowing ? \'btn-default\' : \'btn-info\'}}">'+
              '{{isFollowing ? \'Unfollow\' : \'Follow\'}}'+
              '</button>'
  };
});