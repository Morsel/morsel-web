angular.module( 'Morsel.socialSharing', [] )

//like/unlike a morsel
.directive('socialSharing', function($location){
  return {
    restrict: 'A',
    scope: true,
    replace: true,
    link: function(scope, element, attrs) {
      scope.socialExpanded = true;
      scope.nonSwipeable = true;

      scope.currentUrl = encodeURIComponent($location.absUrl());
    },
    templateUrl: 'socialSharing/socialSharing.tpl.html'
  };
});