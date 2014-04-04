angular.module( 'Morsel.comments', [] )

.directive('morselComments', function(ApiMorsels, AfterLogin, Auth, $location, $q, $modal){
  return {
    restrict: 'A',
    scope: {
      morsel: '=morselComments'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.openComments = function () {
        console.log(scope.morsel);
        var modalInstance = $modal.open({
          templateUrl: 'comments/comments.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            morsel: function () {
              return scope.morsel;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, morsel) {

        $scope.morsel = morsel;
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

        if(!$scope.morsel.comments) {
          getComments();
        }

        //fetch comments for the morsel
        function getComments() {
          ApiMorsels.getComments($scope.morsel.id).then(function(commentData){
            $scope.morsel.comments = commentData;
          });
        }

        function postComment() {
          var deferred = $q.defer();

          ApiMorsels.postComment($scope.morsel.id, $scope.comment.description).then(function(commentData){

            if($scope.morsel.comments) {
              $scope.morsel.comments.unshift(commentData);
            } else {
              $scope.morsel.comments = commentData;
            }
            //clear comment textarea
            $scope.comment.description = '';
            deferred.resolve();
          });

          return deferred.promise;
        }
      };
    },
    template: '<a ng-click="openComments()"><i class="common-chat"></i>{{morsel.comment_count}} comment{{morsel.comment_count===1?\'\':\'s\'}}</a>'
  };
});