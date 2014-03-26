angular.module( 'Morsel.socialSharing', [] )

//like/unlike a morsel
.directive('socialSharing', function(){
  return {
    restrict: 'EA',
    scope: true,
    replace: true,
    link: function(scope, element, attrs) {
      scope.socialExpanded = true;
      scope.nonSwipeable = true;
    },
    templateUrl: 'socialSharing/socialSharing.tpl.html'
  };
});