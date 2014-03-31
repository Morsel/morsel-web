angular.module( 'Morsel.textLimit', [] )

//show/hide an amount of text
.directive('textLimit', function(){
  return {
    restrict: 'A',
    scope: {
      fullContent: '=textContent',
      charLimit: '='
    },
    replace: true,
    link: function(scope, element, attrs) {
      var limitedContent;

      if(scope.fullContent) {
        if(scope.fullContent.length > scope.charLimit) {
          scope.textLimited = true;
          limitedContent = scope.fullContent.slice(0, scope.charLimit);
        } else {
          scope.textLimited = false;
          limitedContent = scope.fullContent;
        }
      } else {
        scope.textLimited = false;
        limitedContent = '';
      }

      scope.textContent = limitedContent;
      scope.expanded = false;
      scope.nonSwipeable = true;

      scope.expand = function() {
        scope.textContent = scope.fullContent;
        scope.expanded = true;
        scope.nonScrollable = true;
      };
      scope.collapse = function() {
        scope.textContent = limitedContent;
        scope.expanded = false;
        scope.nonScrollable = false;
      };
    },
    templateUrl: 'text/textLimit.tpl.html'
  };
});