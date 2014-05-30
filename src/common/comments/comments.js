angular.module( 'Morsel.common.comments', [] )

.directive('mrslItemComments', function(ApiItems, AfterLogin, Auth, $location, $q, $modal, $rootScope){
  return {
    restrict: 'A',
    scope: {
      item: '=mrslItemComments'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var isLoggedIn,
          afterLoginCallback,
          //whether we've hit the server to get comment data yet
          hasFetchedComments = false;

      Auth.getCurrentUserPromise().then(function(userData){
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

      var ModalInstanceCtrl = function ($scope, $modalInstance, $location, $window, AfterLogin, item) {
        $scope.item = item;

        $scope.isLoggedIn = isLoggedIn;

        $scope.comment = {
          description: ''
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.addComment = function() {
          if(isLoggedIn) {
            postComment($scope.comment.description).then(function(){
              //clear comment textarea
              $scope.comment.description = '';
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

        if(!$scope.item.comments) {
          getComments();
        }

        //fetch comments for the item
        function getComments() {
          ApiItems.getComments($scope.item.id).then(function(commentResp){
            $scope.item.comments = commentResp.data;
            hasFetchedComments = true;
          });
        }
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', '$location', '$window', 'AfterLogin', 'item'];
    },
    template: '<a ng-click="openComments()"><i class="common-chat"></i>{{item.comment_count}} comment{{item.comment_count===1?\'\':\'s\'}}</a>'
  };
});