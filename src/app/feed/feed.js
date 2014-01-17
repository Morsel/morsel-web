angular.module( 'Morsel.feed', [])

//directive for a feed object, a collection of posts
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
