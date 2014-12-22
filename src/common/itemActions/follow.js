angular.module( 'Morsel.common.follow', [] )

//follow/unfollow something
.directive('mrslFollow', function(ApiUsers, ApiPlaces, AfterLogin, $location, Auth, $q, $window){
  return {
    scope: {
      idToFollow: '=mrslIdToFollow',
      isFollowing: '=mrslIsFollowing',
      followType: '@mrslFollowType',
      hideIfFollowing: '@mrslHideIfFollowing'
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
        if(AfterLogin.hasCallback('follow')) {
          afterLoginCallback = AfterLogin.getCallback();

          //make sure it's the right item
          if(afterLoginCallback.data && (afterLoginCallback.data.id === scope.idToFollow)) {
            //make sure we're actually loggeed in just in case
            if(isLoggedIn) {
              performToggleFollow().then(function(){
                //remove callback after completion
                AfterLogin.removeCallback();
              });
            }
          }
        }

        //wait until we have the data on who to follow, then decide if we need to show the follow button or not
        scope.$watch('idToFollow', function(newValue, oldValue) {
          if(newValue) {
            if(currentUser && currentUser.id === scope.idToFollow) {
              scope.isSelf = true;
            }
          }
        });
      });

      scope.toggleFollow = function() {
        //check if we're logged in
        if(isLoggedIn) {
          performToggleFollow();
        } else {
          var currentUrl = $location.url();

          //if not, set our callback for after we're logged in
          AfterLogin.setCallback({
            type: 'follow',
            path: currentUrl,
            data: {
              id: scope.idToFollow
            }
          });
          
          $window.location.href = '/join';
        }
      };

      function performToggleFollow() {
        if(scope.followType === 'place') {
          //trying to follow a place - return the promise
          return togglePlace();
        } else {
          //trying to follow a user - return the promise
          return toggleUser();
        }
      }

      function toggleUser() {
        var deferred = $q.defer();

        if(scope.isFollowing) {
          ApiUsers.unfollowUser(scope.idToFollow).then(function(resp) {
            scope.isFollowing = false;

            //emit this so if we're on a profile page, it can update the count
            scope.$emit('users.'+scope.idToFollow+'.followerCount', 'decrease');

            deferred.resolve();
          });
        } else {
          ApiUsers.followUser(scope.idToFollow).then(function(resp) {
            scope.isFollowing = true;
            
            //emit this so if we're on a profile page, it can update the count
            scope.$emit('users.'+scope.idToFollow+'.followerCount', 'increase');
            //emit this so Explore page can pick up
            scope.$emit('explore.user.follow');

            deferred.resolve();
          });
        }

        return deferred.promise;
      }

      function togglePlace() {
        var deferred = $q.defer();

        if(scope.isFollowing) {
          ApiPlaces.unfollowPlace(scope.idToFollow).then(function(resp) {
            scope.isFollowing = false;

            deferred.resolve();
          });
        } else {
          ApiPlaces.followPlace(scope.idToFollow).then(function(resp) {
            scope.isFollowing = true;
            
            deferred.resolve();
          });
        }

        return deferred.promise;
      }
    },
    template: '<button type="button" ng-hide="isSelf || (hideIfFollowing && isFollowing)" ng-click="toggleFollow()" class="btn follow-btn {{isFollowing ? \'btn-default\' : \'btn-info\'}}">'+
              '{{isFollowing ? \'Following\' : \'Follow\'}}'+
              '</button>'
  };
});