angular.module( 'Morsel.itemLike', [] )

//like/unlike an item
.directive('mrslItemLike', function(ApiItems, AfterLogin, $location, Auth, $q){
  return {
    scope: {
      item: '=mrslItemLike'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.toggleItemLike = function() {
        //check if we're logged in
        if(Auth.isLoggedIn()) {
          toggleLike();
        } else {
          var currentUrl = $location.url();

          //if not, set our callback for after we're logged in
          AfterLogin.addCallbacks(function() {
            toggleLike().then(function(){
              $location.path(currentUrl);
            });
          });
          $location.path('/join');
        }
      };

      function toggleLike() {
        var deferred = $q.defer();

        if(scope.item.liked) {
          ApiItems.unlikeItem(scope.item.id).then(function(data) {
            scope.item.liked = data;
            deferred.resolve();
          });
        } else {
          ApiItems.likeItem(scope.item.id).then(function(data) {
            scope.item.liked = data;
            deferred.resolve();
          });
        }

        return deferred.promise;
      }
    },
    template: '<a><i ng-click="toggleItemLike()" class="{{item.liked ? \'common-like\' : \'common-like-empty\'}}"></i>{{item.like_count}} like{{item.like_count===1?\'\':\'s\'}}</a>'
  };
});