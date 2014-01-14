angular.module( 'Morsel.post', [])

.directive('post', function() {
  return {
    restrict : 'EA',
    transclude : false,
    templateUrl : 'feed/post/post.tpl.html',
    scope: {
       post: "="
    },
    link : function(scope, element, attrs) {
    }
  };
});