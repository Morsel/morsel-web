angular.module( 'Morsel.comments', [] )

.directive('itemComments', function(ApiItems, AfterLogin, Auth, $location, $q, $modal){
  return {
    restrict: 'A',
    scope: {
      item: '=itemComments'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.openComments = function () {
        console.log(scope.item);
        var modalInstance = $modal.open({
          templateUrl: 'comments/comments.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            item: function () {
              return scope.item;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, item) {

        $scope.item = item;
        $scope.isChef = Auth.isChef();
        $scope.isLoggedIn = Auth.isLoggedIn();
        $scope.comment = {
          description: ''
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.addComment = function() {
          if(Auth.isLoggedIn()) {
            postComment();
          }
        };

        if(!$scope.item.comments) {
          getComments();
        }

        //fetch comments for the item
        function getComments() {
          ApiItems.getComments($scope.item.id).then(function(commentData){
            $scope.item.comments = commentData;
          });
        }

        function postComment() {
          var deferred = $q.defer();

          ApiItems.postComment($scope.item.id, $scope.comment.description).then(function(commentData){

            if($scope.item.comments) {
              $scope.item.comments.unshift(commentData);
            } else {
              $scope.item.comments = commentData;
            }
            //clear comment textarea
            $scope.comment.description = '';
            deferred.resolve();
          });

          return deferred.promise;
        }
      };
    },
    template: '<a ng-click="openComments()"><i class="common-chat"></i>{{item.comment_count}} comment{{item.comment_count===1?\'\':\'s\'}}</a>'
  };
});