angular.module( 'Morsel.common.activityFeed', [] )

.directive('mrslActivityFeed', function(){
  return {
    scope: {
      feed: '=mrslActivityFeed',
      loadActivity: '=mrslActivityFeedViewMoreFunc',
      view: '@mrslActivityFeedView'
    },
    replace: true,
    link: function(scope, element, attrs) {
    },
    templateUrl: 'common/user/activityFeed.tpl.html'
  };
});