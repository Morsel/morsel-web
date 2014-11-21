angular.module('Morsel.common.morselActions', [])

.directive('mrslMorselActions', function($anchorScroll, $location, $document, $window) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorselActions',
      layout: '=mrslMorselActionsLayout'
    },
    link: function(scope, element) {
      var scrollYPosition = 0,
          menuFixed;

      winEl = angular.element($window);

      scope.element = element;

      /*scope.windowHeight = $window.innerHeight;

      //check if menu has passed spot where it should stay fixed
      menuFixed = _.throttle(function(e) {
        var newScrollYPosition = $document.scrollTop(),
            elementWrapTop = scope.element.parent().prop('offsetTop');

        if(elementWrapTop > newScrollYPosition+scope.windowHeight) {
          scope.element.addClass('fixed');
        } else {
          scope.element.removeClass('fixed');
        }
      }, 250);

      $document.on('scroll', menuFixed);

      onBrowserResize = _.debounce(function(){
        scope.windowHeight = $window.innerHeight;
      }, 300);

      winEl.bind('resize', onBrowserResize);

      //unbind
      scope.$on('$destroy', function() {
        $document.off('scroll', menuFixed);
        winEl.unbind('resize', onBrowserResize);
      });
      */
    },
    templateUrl: 'common/morsels/morselActions.tpl.html'
  };
});