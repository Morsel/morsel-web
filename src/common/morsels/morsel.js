angular.module('Morsel.common.morsel', [])

.directive('mrslMorsel', function($window, PhotoHelpers, MORSELPLACEHOLDER, Auth) {
  var //debounce on page resize/orientation change
      orientationChangeTime = 300,
      moreScrollTime = 500;

  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorsel'
    },
    link: function(scope) {
      var onOrientationChange,
          winEl = angular.element($window),
          pageHeight,
          $body = angular.element(document.getElementsByTagName('body'));

      //hold all our computed layout measurements
      scope.layout = {};
      updateItemHeight();

      scope.canEdit = false;

      Auth.getCurrentUserPromise().then(function(userData){
        scope.canEdit = scope.morsel.creator.id === userData.id;
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
                ['(min-width: 321px)', primaryItemPhotos._480x480],
                ['screen-xs', primaryItemPhotos._640x640],
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
                  ['(min-width: 321px)', lastItemWithPhotos.photos._480x480],
                  ['screen-xs', lastItemWithPhotos.photos._640x640],
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
              ['(min-width: 321px)', item.photos._480x480],
              ['screen-xs', item.photos._640x640]
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

      function updateItemHeight() {
        pageHeight = window.innerHeight;
        scope.layout.pageHeight = pageHeight+'px';
      }

      //resize cover page on resize
      onOrientationChange = _.debounce(function(){
        updateItemHeight();
        scope.$apply();
      }, orientationChangeTime);

      // handle orientation change
      winEl.bind('orientationchange', onOrientationChange);
      winEl.bind('resize', onOrientationChange);

      scope.$on('$destroy', function() {
        winEl.unbind('orientationchange', onOrientationChange);
        winEl.unbind('resize', onOrientationChange);
      });

      scope.moreClick = function() {
        $body.scrollTop(pageHeight, moreScrollTime);
      };
    },
    templateUrl: 'common/morsels/morsel.tpl.html'
  };
})

.directive('mrslItemDescription', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      item: '=mrslItemDescription'
    },
    link: function(scope, element) {
      scope.formatDescription = function() {
        if(scope.item && scope.item.description) {
          return scope.item.description.replace(/(\r\n|\n|\r)/g,"<br />");
        } else {
          return '';
        }
      };
    },
    template: '<div class="item-description"><p ng-bind-html="formatDescription()"></p></div>'
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