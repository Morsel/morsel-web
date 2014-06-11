angular.module( 'Morsel.common.likeableFeed', [] )

.directive('mrslLikeableFeed', function(MORSELPLACEHOLDER){
  return {
    scope: {
      feed: '=mrslLikeableFeed',
      user: '=mrslLikeableFeedUser'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.morselPlaceholder = MORSELPLACEHOLDER;
    },
    templateUrl: 'common/user/likeableFeed.tpl.html'
  };
});