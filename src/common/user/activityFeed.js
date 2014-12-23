angular.module( 'Morsel.common.activityFeed', [] )

.directive('mrslActivityFeed', function(ACTIVITY_LIST_NUMBER){
  return {
    scope: {
      feed: '=mrslActivityFeed',
      loadActivity: '=mrslActivityFeedViewMoreFunc'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.ACTIVITY_LIST_NUMBER = ACTIVITY_LIST_NUMBER;
    },
    templateUrl: 'common/user/activityFeed.tpl.html'
  };
});