angular.module( 'Morsel.comments', [] )

.directive('morselComments', function(ApiMorsels, AfterLogin, Auth, $location, $q){
  return {
    restrict: 'A',
    scope: {
      morsel: '=commentsMorsel',
      commentsTrigger: '='
    },
    replace: true,
    link: function(scope, element, attrs) {
      var getComments,
          addComment;

      scope.nonSwipeable = true;
      scope.nonScrollable = true;

      scope.isChef = Auth.isChef();
      scope.isLoggedIn = Auth.isLoggedIn();
      
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
        if(Auth.isLoggedIn()) {
          postComment();
        } else {
          var currentUrl = $location.url();

          //if not, set our callback for after we're logged in
          AfterLogin.addCallbacks(function() {
            postComment().then(function(){
              $location.path(currentUrl);
            });
          });
          $location.path('/join');
        }
      };

      function postComment() {
        var deferred = $q.defer();

        ApiMorsels.postComment(scope.morsel.id, scope.addCommentDescription).then(function(commentData){

          if(scope.morsel.comments) {
            scope.morsel.comments.unshift(commentData);
          } else {
            scope.morsel.comments = commentData;
          }
          //clear comment textarea
          scope.addCommentDescription = '';
          deferred.resolve();
        });

        return deferred.promise;
      }
    },
    templateUrl: 'comments/comments.tpl.html'
  };
});