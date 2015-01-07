angular.module('Morsel.common.morselActions', [])

.directive('mrslMorselActions', function($document, $window, ApiMorsels, Auth) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorselActions',
      layout: '=mrslMorselActionsLayout'
    },
    link: function(scope, element) {
      var menuFixed,
          relativeWrapMarginBottom = 20;

      scope.element = element;
      scope.menuHeightCoverOffset = 10;

      Auth.getCurrentUserPromise().then(function(userData){
        scope.currentUser = userData;
      });


      //check if menu has passed spot where it should stay fixed
      menuFixed = _.throttle(function(e) {
        var offsetWrapTop = scope.element[0].getBoundingClientRect().top,
            menuHeight = scope.element.children()[0].offsetHeight;

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

      scope.untagMorsel = function() {
        ApiMorsels.untagUser(scope.morsel.id, scope.currentUser.id).then(function(){
          scope.morsel.tagged = false;

          scope.$emit('morsel.untag', scope.currentUser.id);

          $window.alert('You have been untagged from this morsel');
        }, function(){
          $window.alert('There was a problem untagging you from this morsel. Please try again.');
        });
      };
    },
    templateUrl: 'common/morsels/morselActions.tpl.html'
  };
});