angular.module( 'Morsel.morsel', [])

//directive for an individual morsel
.directive('morsel', function(ApiMorsels) {
  return {
    restrict : 'EA',
    transclude : false,
    templateUrl : 'feed/post/morsel/morsel.tpl.html',
    scope: {
       morsel: "="
    },
    link : function(scope, element, attrs) {
      scope.toggleMorselLike = function() {
        if(scope.morsel.liked) {
          ApiMorsels.unlikeMorsel(scope.morsel.id).then(function(data) {
            scope.morsel.liked = data;
          });
        } else {
          ApiMorsels.likeMorsel(scope.morsel.id).then(function(data) {
            scope.morsel.liked = data;
          });
        }
      };
    }
  };
});