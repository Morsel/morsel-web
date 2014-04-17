angular.module( 'Morsel.morselLike', [] )

//like/unlike a morsel
.directive('morselLike', function(ApiItems, AfterLogin, $location, Auth, $q){
  return {
    scope: {
      morsel: '=morselLike'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.toggleMorselLike = function() {
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

        if(scope.morsel.liked) {
          ApiItems.unlikeItem(scope.morsel.id).then(function(data) {
            scope.morsel.liked = data;
            deferred.resolve();
          });
        } else {
          ApiItems.likeItem(scope.morsel.id).then(function(data) {
            scope.morsel.liked = data;
            deferred.resolve();
          });
        }

        return deferred.promise;
      }
    },
    template: '<a><i ng-click="toggleMorselLike()" class="{{morsel.liked ? \'common-like\' : \'common-like-empty\'}}"></i>{{morsel.like_count}} like{{morsel.like_count===1?\'\':\'s\'}}</a>'
  };
});