angular.module( 'Morsel.feed', [])

.directive('feed', function() {
  return {
    restrict : 'EA',
    transclude : false,
    templateUrl : 'feed/feed.tpl.html',
    scope: {
       posts: "="
    },
    link : function(scope, element, attrs) {
    }
  };
});
