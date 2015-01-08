angular.module('Morsel.common.morselBlock', [])

.directive('mrslMorselBlock', function(PhotoHelpers, MORSELPLACEHOLDER) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorselBlock',
      morselFeedItemId: '=mrslMorselBlockFeedItemId',
      spacer: '@mrslMorselBlockSpacer'
    },
    link: function(scope, element) {
      scope.getCoverPhotoArray = function() {
        var primaryItemPhotos,
            $el = element[0],
            needsBigPicture = $el.offsetWidth > 320;

        if(scope.morsel) {
          primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(scope.morsel);

          if(primaryItemPhotos) {
            if(needsBigPicture) {
              return [
                ['default', primaryItemPhotos._640x640]
              ];
            } else {
              return [
                ['default', primaryItemPhotos._320x320]
              ];
            }
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
    },
    templateUrl: 'common/morsels/morsel-block.tpl.html'
  };
});