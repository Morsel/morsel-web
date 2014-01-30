angular.module( 'Morsel.morsel', [])

//directive for an individual morsel
.directive('morsel', function() {
  return {
    restrict : 'EA',
    transclude : false,
    templateUrl : 'feed/post/morsel/morsel.tpl.html',
    scope: {
       morsel: "="
    },
    link : function(scope, element, attrs) {
    }
  };
});