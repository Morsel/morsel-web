angular.module( 'Morsel.morselLike', [] )

//like/unlike a morsel
.directive('morselLike', function(ApiMorsels){
  return {
    scope: false,
    replace: true,
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
    template: '<i ng-click="toggleMorselLike()" class="{{morsel.liked ? \'common-like\' : \'common-like-empty\'}}"></i>'
  };
});