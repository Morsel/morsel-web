angular.module( 'Morsel.socialSharing', [] )

//like/unlike a morsel
.directive('socialSharing', function(){
  return {
    restrict: 'EA',
    scope: false,
    replace: true,
    link: function(scope, element, attrs) {
    },
    templateUrl: 'socialSharing/socialSharing.tpl.html'
  };
});