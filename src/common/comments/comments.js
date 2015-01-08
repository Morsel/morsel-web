angular.module( 'Morsel.common.comments', [] )

.directive('mrslItemComments', function(ApiItems, AfterLogin, Auth, $location, $q, $modal, $rootScope){
  return {
    restrict: 'A',
    scope: {
      item: '=mrslItemComments'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var currentUser,
          isLoggedIn,
          afterLoginCallback,
          //whether we've hit the server to get comment data yet
          hasFetchedComments = false;

      Auth.getCurrentUserPromise().then(function(userData){
        currentUser = userData;
        isLoggedIn = Auth.isLoggedIn();

        //check for an afterlogin callback on load
        if(AfterLogin.hasCallback('comment')) {
          afterLoginCallback = AfterLogin.getCallback();

          //make sure it's the right item
          if(afterLoginCallback.data && (afterLoginCallback.data.itemId === scope.item.id)) {
            //make sure we're actually loggeed in just in case
            if(isLoggedIn) {
              postComment(afterLoginCallback.data.description).then(function(){
                //remove callback after completion
                AfterLogin.removeCallback();
              });
            }
          }
        }
      });

      scope.openComments = function () {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/comments/comments.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            item: function () {
              return scope.item;
            }
          }
        });
      };

      function postComment(description) {
        var deferred = $q.defer();

        ApiItems.postComment(scope.item.id, description).then(function(commentResp){

          //if we already have comment data
          if(scope.item.comments) {
            //update it
            scope.item.comments.unshift(commentResp.data);
            //update comment number
            scope.item.comment_count = scope.item.comments.length;
          } else {
            //if we've already hit the server, but there were no comments
            if(hasFetchedComments) {
              //add this one
              scope.item.comments = new Array(commentResp.data);
              //update comment number
              scope.item.comment_count = 1;
            } else {
              //don't update comment array, we'll get it later
              //update comment number
              scope.item.comment_count++;
            }
          }
          deferred.resolve();
        });

        return deferred.promise;
      }

      function deleteComment(commentId) {
        ApiItems.deleteComment(scope.item.id, commentId).then(function(commentResp){
          //remove the comment from our list
          scope.item.comments = _.reject(scope.item.comments, function(c){
            return c.id === commentId;
          });

          //update comment number
          scope.item.comment_count = scope.item.comments.length;
        });
      }

      var ModalInstanceCtrl = function ($scope, $modalInstance, $location, $window, AfterLogin, item) {
        $scope.item = item;

        $scope.isLoggedIn = isLoggedIn;

        $scope.comment = {
          description: ''
        };

        $scope.formatComment = function(comment) {
          return comment.replace(/(\r\n|\n|\r)/g,"<br />");
        };

        $scope.currentUser = currentUser;

        $scope.cancel = function () {
          $scope.$broadcast('commentupdate', 5);
          $modalInstance.dismiss('cancel');
        };

        $scope.addComment = function() {
          //disable button
          $scope.addCommentForm.$setValidity('addingComment', false);

          if(isLoggedIn) {
            postComment($scope.comment.description).then(function(){
              //clear comment textarea
              $scope.comment.description = '';

              //enable add button
              $scope.addCommentForm.$setValidity('addingComment', true);
            });
          } else {
            var currentUrl = $location.url();

            //if not, set our callback for after we're logged in
            AfterLogin.setCallback({
              type: 'comment',
              path: currentUrl,
              data: {
                description: $scope.comment.description,
                itemId: $scope.item.id
              }
            });
            
            $window.location.href = '/join';
          }
        };

        $scope.deleteComment = function(commentId) {
          var confirmed = confirm('Are you sure you want to delete this comment?');

          if(confirmed) {
            deleteComment(commentId);
          }
        };

        //fetch comments for the item
        $scope.getComments = function(params) {
          ApiItems.getComments($scope.item.id, params).then(function(commentResp){
            if($scope.item.comments) {
              //concat them with new data after old data, then reverse with a filter
              $scope.item.comments = $scope.item.comments.concat(commentResp.data);
            } else {
              $scope.item.comments = commentResp.data;
            }
            
            hasFetchedComments = true;
          });
        };
      };
    },
    template: '<div ng-click="openComments()"><i ng-class="{\'common-comment-empty\':item.comment_count===0, \'common-comment-filled\':item.comment_count > 0}"></i><a ng-show="item.comment_count > 0" class="dark-link">{{item.comment_count}}<span> comment{{item.comment_count===1?\'\':\'s\'}}</span></a><a ng-show="item.comment_count === 0" class="dark-link"><span>Add comment</span></a></div>'
  };
});