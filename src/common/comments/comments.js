angular.module( 'Morsel.comments', [] )

.directive('mrslItemComments', function(ApiItems, AfterLogin, Auth, $location, $q, $modal, $rootScope){
  return {
    restrict: 'A',
    scope: {
      item: '=mrslItemComments'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.openComments = function () {
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

        $rootScope.$on('$locationChangeSuccess', function () {
          $modalInstance.dismiss('cancel');
        });

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
            //update comment number
            $scope.item.comment_count = $scope.item.comments.length;
            deferred.resolve();
          });

          return deferred.promise;
        }
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'item'];
    },
    template: '<a ng-click="openComments()"><i class="common-chat"></i>{{item.comment_count}} comment{{item.comment_count===1?\'\':\'s\'}}</a>'
  };
});