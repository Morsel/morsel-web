angular.module( 'Morsel.post', [])

//directive for a post object, a collection of morsels
.directive('post', function($location) {
  return {
    restrict : 'EA',
    templateUrl : 'feed/post/post.tpl.html',
    scope: {
       post: "="
    },
    link : function(scope, element, attrs) {
      scope.showPostDetails = function() {
        var post = scope.post;

        $location.path('/'+ post.creator.username + '/' + post.id + '/' + (post.slug ? post.slug : ''));
      };
    }
  };
});