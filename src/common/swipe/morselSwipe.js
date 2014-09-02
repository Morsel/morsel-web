angular.module('Morsel.common.morselSwipe', [
  'duScroll'
])

.directive('mrslMorselSwipe', function($window, $document, PhotoHelpers, MORSELPLACEHOLDER) {
  var //debounce on page resize/orientation change
      orientationChangeTime = 300,
      moreScrollTime = 500;

  return {
    restrict: 'A',
    scope: true,
    link: function(scope, iElement, iAttributes) {
      var onOrientationChange,
          winEl = angular.element($window),
          pageHeight,
          $pageWrapper = angular.element(document.getElementById('page-wrapper'));

      scope.getCoverPhotoArray = function(morsel, previewSized) {
        var primaryItemPhotos;

        if(morsel.items) {
          primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(morsel);

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
            var lastItemWithPhotos = PhotoHelpers.findLastItemWithPhotos(morsel.items);

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

      iAttributes.$observe('mrslMorselSwipe', function(newValue, oldValue) {
        updateItemHeight();
      });

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
        $pageWrapper.scrollTop(pageHeight, moreScrollTime);
      };
    }
  };
});