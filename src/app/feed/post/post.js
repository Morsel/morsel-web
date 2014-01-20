angular.module( 'Morsel.post', [])

//directive for a post object, a collection of morsels
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