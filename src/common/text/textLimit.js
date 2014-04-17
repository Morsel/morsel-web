angular.module( 'Morsel.textLimit', [] )

//show/hide an amount of text
.directive('textLimit', function($modal, $window){
  return {
    restrict: 'A',
    scope: {
      fullContent: '=textContent',
      charLimit: '='
    },
    replace: true,
    link: function(scope, element, attrs) {
      var limitedContent,
          smallBreakpoint = $window.innerWidth <= 992; //total hack

      if(scope.fullContent) {
        if(smallBreakpoint && (scope.fullContent.length > scope.charLimit)) {
          scope.textLimited = true;
          limitedContent = scope.fullContent.slice(0, scope.charLimit);
        } else if(scope.fullContent.length > (scope.charLimit*3)) {
          scope.textLimited = true;
          limitedContent = scope.fullContent.slice(0, scope.charLimit*3);
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

      scope.collapse = function() {
        scope.textContent = limitedContent;
        scope.expanded = false;
      };

      scope.expand = function () {
        var modalInstance = $modal.open({
          templateUrl: 'text/textOverlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            textContent: function () {
              return scope.fullContent;
            }
          }
        });

        scope.expanded = true;
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, textContent) {
        $scope.textContent = textContent;

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };
    },
    templateUrl: 'text/textLimit.tpl.html'
  };
})

.directive('textLimitBtn', function(){
  return {
    restrict: 'A',
    scope: true,
    replace: false,
    link: function(scope, element, attrs) {
      scope.nonSwipeable = true;
    }
  };
});