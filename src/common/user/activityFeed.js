angular.module( 'Morsel.common.activityFeed', [] )

.directive('mrslActivityFeed', function(MORSELPLACEHOLDER){
  return {
    scope: {
      feed: '=mrslActivityFeed',
      user: '=mrslActivityFeedUser'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.morselPlaceholder = MORSELPLACEHOLDER;
    },
    templateUrl: 'common/user/activityFeed.tpl.html'
  };
});