angular.module( 'Morsel.common.textLimit', [] )

//show/hide an amount of text
.directive('mrslTextLimit', function($modal, $window, $rootScope){
  return {
    restrict: 'A',
    scope: {
      fullContent: '=mrslTextContent',
      charLimit: '=mrslCharLimit'
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
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/text/textOverlay.tpl.html',
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
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'textContent'];
    },
    templateUrl: 'common/text/textLimit.tpl.html'
  };
})

.directive('mrslTextLimitBtn', function(){
  return {
    restrict: 'A',
    scope: true,
    replace: false,
    link: function(scope, element, attrs) {
    }
  };
});