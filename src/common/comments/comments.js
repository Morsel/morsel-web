angular.module( 'Morsel.comments', [] )

.directive('morselComments', function(ApiMorsels){
  return {
    restrict: 'EA',
    scope: {
      morsel: '=commentsMorsel',
      commentsTrigger: '=',
      isLoggedIn: '='
    },
    replace: true,
    link: function(scope, element, attrs) {
      var getComments,
          addComment;

      scope.nonSwipeable = true;
      scope.nonScrollable = true;
      
      scope.$watch('commentsTrigger', function(newValue) {
        if(newValue) {
          //if we don't have our comments already
          if(!scope.morsel.comments) {
            getComments();
          }
        }
      });

      //fetch comments for the morsel in scope
      getComments = function(morselId) {
        ApiMorsels.getComments(scope.morsel.id).then(function(commentData){
          scope.morsel.comments = commentData;
        });
      };

      scope.addComment = function() {
        ApiMorsels.postComment(scope.morsel.id, scope.addCommentDescription).then(function(commentData){

          if(scope.morsel.comments) {
            scope.morsel.comments.unshift(commentData);
          } else {
            scope.morsel.comments = commentData;
          }
          //clear comment textarea
          scope.addCommentDescription = '';
        });
      };
    },
    templateUrl: 'comments/comments.tpl.html'
  };
});