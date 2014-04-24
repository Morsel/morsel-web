angular.module( 'Morsel.follow', [] )

//follow/unfollow something
.directive('mrslFollow', function(ApiItems, AfterLogin, $location, Auth, $q){
  return {
    scope: {
      idToFollow: '=mrslIdToFollow'
    },
    replace: true,
    link: function(scope, element, attrs) {
      //temporary - not sure where this will come from yet
      scope.following = true;

      scope.toggleFollow = function() {
        scope.following = !scope.following;
        /*//check if we're logged in
        if(Auth.isLoggedIn()) {
          performToggleFollow();
        } else {
          var currentUrl = $location.url();

          //if not, set our callback for after we're logged in
          AfterLogin.addCallbacks(function() {
            performToggleFollow().then(function(){
              $location.path(currentUrl);
            });
          });
          $location.path('/join');
        }*/
      };

      function performToggleFollow() {
        var deferred = $q.defer();

        //do some stuff

        return deferred.promise;
      }
    },
    template: '<button ng-click="toggleFollow()" class="btn {{following ? \'btn-default\' : \'btn-info\'}}">'+
              '{{following ? \'Unfollow\' : \'Follow\'}}'+
              '</button>'
  };
});