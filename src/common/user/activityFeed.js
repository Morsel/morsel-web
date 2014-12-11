angular.module( 'Morsel.common.activityFeed', [] )

.directive('mrslActivityFeed', function(MORSELPLACEHOLDER, PhotoHelpers){
  return {
    scope: {
      feed: '=mrslActivityFeed',
      user: '=mrslActivityFeedUser'
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
    templateUrl: 'common/user/activityFeed.tpl.html'
  };
});