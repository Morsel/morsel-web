angular.module('Morsel.common.morselBlock', [])

.directive('mrslMorselBlock', function(PhotoHelpers, MORSELPLACEHOLDER) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorselBlock',
      noUser: '@mrslMorselBlockNoUser',
      noStats: '@mrslMorselBlockNoStats',
      noPlace: '@mrslMorselBlockNoPlace',
      morselFeedItemId: '=mrslMorselBlockFeedItemId',
      spacer: '@mrslMorselBlockSpacer'
    },
    link: function(scope, element) {
      scope.getCoverPhotoArray = function() {
        var primaryItemPhotos,
            $el = element[0],
            needsBigPicture = $el.offsetWidth > 320;

        if(scope.morsel && scope.morsel.items) {
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
            var lastItemWithPhotos = PhotoHelpers.findLastItemWithPhotos(scope.morsel.items);

            if(lastItemWithPhotos) {
              if(needsBigPicture) {
                return [
                  ['default', lastItemWithPhotos.photos._640x640]
                ];
              } else {
                return [
                  ['default', lastItemWithPhotos.photos._320x320]
                ];
              }
            } else {
              //no items have photos

              return [
                ['default', MORSELPLACEHOLDER]
              ];
            }
          }
        } else {
          //return blank
          return [];
        }
      };
    },
    templateUrl: 'common/morsels/morselBlock.tpl.html'
  };
});