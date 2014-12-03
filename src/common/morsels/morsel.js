angular.module('Morsel.common.morsel', [])

.constant('COVER_PHOTO_PERCENTAGE', 0.6)

.directive('mrslMorsel', function($window, PhotoHelpers, MORSELPLACEHOLDER, Auth, COVER_PHOTO_PERCENTAGE, ApiMorsels, ApiUsers, ParseUserText) {
  var //debounce on page resize/orientation change
      orientationChangeTime = 300;

  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorsel'
    },
    link: function(scope) {
      var onOrientationChange,
          winEl = angular.element($window),
          windowOldWidth = window.innerWidth,
          taggedUserShownCount = 2;

      //hold all our computed layout measurements
      scope.layout = {};
      updateCoverHeight();

      scope.canEdit = false;

      Auth.getCurrentUserPromise().then(function(userData){
        scope.canEdit = scope.morsel.creator.id === userData.id;
      });

      if(scope.morsel.tagged_users_count > 0) {
        ApiMorsels.getTaggedUsers(scope.morsel.id).then(function(usersResp){
          scope.taggedUsers = usersResp.data;
          updateTaggedUserList();
        });
      }

      scope.$on('morsel.untag', function(e, userId) {
        scope.taggedUsers = _.reject(scope.taggedUsers, function(user){
          return user.id === userId;
        });

        scope.morsel.tagged_users_count--;

        updateTaggedUserList();
      });

      function updateTaggedUserList() {
        var shownTaggedUsers;

        shownTaggedUsers = scope.taggedUsers.slice(0, taggedUserShownCount);

        scope.morsel.shownTaggedUsers = shownTaggedUsers;
        scope.morsel.hiddenTaggedUserCount = scope.morsel.tagged_users_count - shownTaggedUsers.length;
      }

      //get user info for following button
      ApiUsers.getUser(scope.morsel.creator.id).then(function(userResp){
        scope.morsel.creator = userResp.data;
      });

      scope.getCoverPhotoArray = function(previewSized) {
        var primaryItemPhotos;

        if(scope.morsel && scope.morsel.items) {
          primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(scope.morsel);

          if(primaryItemPhotos) {
            if(previewSized) {
              return primaryItemPhotos._50x50;
            } else {
              return [
                ['default', primaryItemPhotos._320x320],
                ['(min-width: 321px)', primaryItemPhotos._640x640],
                ['screen-md', primaryItemPhotos._992x992]
              ];
            }
          } else {
            var lastItemWithPhotos = PhotoHelpers.findLastItemWithPhotos(scope.morsel.items);

            if(lastItemWithPhotos) {
              if(previewSized) {
                return lastItemWithPhotos.photos._50x50;
              } else {
                return [
                  ['default', lastItemWithPhotos.photos._320x320],
                  ['(min-width: 321px)', lastItemWithPhotos.photos._640x640],
                  ['screen-md', lastItemWithPhotos.photos._992x992]
                ];
              }
            } else {
              //no items have photos
              if(previewSized) {
                return MORSELPLACEHOLDER;
              } else {
                return [
                  ['default', MORSELPLACEHOLDER]
                ];
              }
            }
            return [
              ['default', MORSELPLACEHOLDER]
            ];
          }
        } else {
          //return blank
          return [];
        }
      };

      scope.getItemPhotoArray = function(item) {
        if(item) {
          if(item.photos) {
            return [
              ['default', item.photos._320x320],
              ['(min-width: 321px)', item.photos._640x640]
            ];
          } else {
            return [
              ['default', MORSELPLACEHOLDER]
            ];
          }
        } else {
          //return blank
          return [];
        }
      };

      scope.formatSummary = function() {
        if(scope.morsel && scope.morsel.summary) {
          return ParseUserText.hashtags(ParseUserText.addBreakTags(scope.morsel.summary));
        }
      };

      function updateCoverHeight() {
        scope.layout.coverHeight = window.innerHeight*COVER_PHOTO_PERCENTAGE;
      }

      //resize cover page on resize
      onOrientationChange = _.debounce(function(){
        //make sure the width changed and it's not just the address bar moving on mobile
        if(window.innerWidth != windowOldWidth) {
          windowOldWidth = window.innerWidth;
          updateCoverHeight();
          scope.$apply();
        }
      }, orientationChangeTime);

      // handle orientation change
      winEl.bind('orientationchange', onOrientationChange);
      winEl.bind('resize', onOrientationChange);

      scope.$on('$destroy', function() {
        winEl.unbind('orientationchange', onOrientationChange);
        winEl.unbind('resize', onOrientationChange);
      });
    },
    templateUrl: 'common/morsels/morsel.tpl.html'
  };
})

.directive('mrslItemDescription', function(ParseUserText) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      item: '=mrslItemDescription'
    },
    link: function(scope, element) {
      scope.formatDescription = function() {
        if(scope.item && scope.item.description) {
          return ParseUserText.addBreakTags(scope.item.description);
        }
      };
    },
    template: '<div class="item-description" ng-if="item.description"><p ng-bind-html="formatDescription()"></p></div>'
  };
})

.directive('mrslFeedNav', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      feedItem: '=mrslFeedNav',
      navDirection: '@mrslFeedNavDirection'
    },
    link: function(scope, element) {
      scope.nextNavigation = scope.navDirection === 'next';
    },
    templateUrl: 'common/morsels/morselFeedNav.tpl.html'
  };
});