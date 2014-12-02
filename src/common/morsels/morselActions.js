angular.module('Morsel.common.morselActions', [])

.directive('mrslMorselActions', function($document, $window, ApiMorsels) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorselActions',
      layout: '=mrslMorselActionsLayout'
    },
    link: function(scope, element) {
      var menuFixed,
          menuHeight = element.children()[0].offsetHeight,
          relativeWrapMarginBottom = 20;

      scope.element = element;
      scope.menuHeightCoverOffset = 10;

      //check if menu has passed spot where it should stay fixed
      menuFixed = _.throttle(function(e) {
        var offsetWrapTop = scope.element[0].getBoundingClientRect().top;

        //mobile
        if($window.innerHeight < offsetWrapTop + menuHeight) {
          //fix the menu to the bottom of the screen (mobile)
          scope.element.addClass('fixed');
          scope.wrapHeight = menuHeight+'px';
        } else {
          //menu is position=relative
          scope.element.removeClass('fixed');
          scope.wrapHeight = 'auto';
        }

        scope.$apply();
      }, 50);

      $document.on('scroll', menuFixed);

      //unbind
      scope.$on('$destroy', function() {
        $document.off('scroll', menuFixed);
      });

      scope.reportInappropriate = function() {
        ApiMorsels.reportInappropriate(scope.morsel.id).then(function(){
          $window.alert('Your report was successful. Thanks for the feedback!');
        }, function(){
          $window.alert('There was a problem reporting this morsel. Please try again.');
        });
      };
    },
    templateUrl: 'common/morsels/morselActions.tpl.html'
  };
});