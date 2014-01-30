angular.module( 'Morsel.morselLike', [] )

//like/unlike a morsel
.directive('morselLike', function(ApiMorsels){
  return {
    scope: false,
    link: function(scope, element, attrs) {
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
    },
    template: '<i ng-click="toggleMorselLike()" class="like-morsel glyphicon {{morsel.liked ? \'glyphicon-heart\' : \'glyphicon-heart-empty\'}}"></i>'
  };
});