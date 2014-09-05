angular.module('Morsel.common.morselSummary', [])

.directive('mrslMorselSummary', function($window, PhotoHelpers, MORSELPLACEHOLDER) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorselSummary',
      morselFeedItemId: '=mrslFeedItemId'
    },
    link: function(scope) {
      scope.getCoverPhotoArray = function(previewSized) {
        var primaryItemPhotos;

        if(scope.morsel.items) {
          primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(scope.morsel);

          if(primaryItemPhotos) {
            if(previewSized) {
              return primaryItemPhotos._50x50;
            } else {
              return [
                ['default', primaryItemPhotos._100x100],
                ['(min-width: 300px)', primaryItemPhotos._240x240],
                ['(min-width: 720px)', primaryItemPhotos._320x320]
              ];
            }
          } else {
            var lastItemWithPhotos = PhotoHelpers.findLastItemWithPhotos(scope.morsel.items);

            if(lastItemWithPhotos) {
              if(previewSized) {
                return lastItemWithPhotos.photos._50x50;
              } else {
                return [
                  ['default', lastItemWithPhotos.photos._100x100],
                  ['(min-width: 300px)', lastItemWithPhotos.photos._240x240],
                  ['(min-width: 720px)', lastItemWithPhotos.photos._320x320]
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
    },
    templateUrl: 'common/morsels/morselSummary.tpl.html'
  };
});