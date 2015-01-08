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
          return primaryPhotos._100x100;
        } else {
          return MORSELPLACEHOLDER;
        }
      };
    },
    templateUrl: 'common/user/likeable-feed.tpl.html'
  };
});