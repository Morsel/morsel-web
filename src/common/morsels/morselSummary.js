angular.module('Morsel.common.morselSummary', [])

.directive('mrslMorselSummary', function($window, PhotoHelpers, MORSELPLACEHOLDER, Auth) {
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

        if(scope.morsel && scope.morsel.items) {
          primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(scope.morsel);

          if(primaryItemPhotos) {
            if(previewSized) {
              return primaryItemPhotos._50x50;
            } else {
              return [
                ['default', primaryItemPhotos._320x320]
              ];
            }
          } else {
            var lastItemWithPhotos = PhotoHelpers.findLastItemWithPhotos(scope.morsel.items);

            if(lastItemWithPhotos) {
              if(previewSized) {
                return lastItemWithPhotos.photos._50x50;
              } else {
                return [
                  ['default', lastItemWithPhotos.photos._320x320]
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

      scope.canEdit = false;

      Auth.getCurrentUserPromise().then(function(userData){
        scope.canEdit = scope.morsel.creator.id === userData.id;
      });
    },
    templateUrl: 'common/morsels/morselSummary.tpl.html'
  };
});