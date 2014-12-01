angular.module( 'Morsel.common.likeableFeed', [] )

.directive('mrslLikeableFeed', function(MORSELPLACEHOLDER, PhotoHelpers){
  return {
    scope: {
      feed: '=mrslLikeableFeed',
      user: '=mrslLikeableFeedUser'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.morselPlaceholder = MORSELPLACEHOLDER;

      scope.getMorselPhoto = function(morsel) {
        var primaryPhotos = PhotoHelpers.findPrimaryItemPhotos(morsel);

        if(primaryPhotos) {
          return primaryPhotos._80x80;
        } else {
          primaryPhotos = PhotoHelpers.findLastItemWithPhotos(morsel.items);

          if(primaryPhotos) {
            return primaryPhotos._80x80;
          } else {
            return MORSELPLACEHOLDER;
          }
        }
      };
    },
    templateUrl: 'common/user/likeableFeed.tpl.html'
  };
});