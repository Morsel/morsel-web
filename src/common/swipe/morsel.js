angular.module('Morsel.common.morsel', [])

.directive('mrslMorsel', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorsel'
    },
    link: function(scope) {
      //scope vars for individual morsel
      scope.feedState = {
        inMorsel : false,
        onShare : false
      };

      scope.$on('feed.updateState', function(e, feedState){
        _.extend(scope.feedState, feedState);
        _.defer(function(){scope.$apply();});
      });

      scope.$on('item.updateState', function(e, feedState){
        _.extend(scope.feedState, feedState);
        _.defer(function(){scope.$apply();});
      });

      scope.$on('item.toggleDescriptionOpen', function(e, descriptionOpen){
        scope.layout.descriptionOpen = descriptionOpen;
      });

      //hold all our computed layout measurements
      scope.layout = {};

      scope.expandDescription = function(itemId){
        scope.$broadcast('item.expandDescription', itemId);
      };
    },
    templateUrl: 'common/swipe/morsel.tpl.html'
  };
})

.directive('mrslItemDescription', function($window, Transform, MINIHEADERHEIGHT, presetMediaQueries) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      item: '=mrslItemDescription',
      nonScrollable: '@mrslNonScrollable'
    },
    link: function(scope, element) {
      var origHeight,
          //amount of photo to show when expanding text
          photoGap = 30;

      //don't allow scrolling or swiping on this when it's expanded
      scope.nonScrollable = false;
      scope.nonSwipeable = false;

      scope.$on('item.expandDescription', function(e, itemId) {
        scope.expandDescription(itemId);
      });

      scope.expandDescription = function(itemId){
        //check for the right item in the morsel
        if(scope.item.id === itemId) {
          //make sure we're on a small viewport
          if(!matchMedia(presetMediaQueries['screen-md']).matches) {
            element[0].style[Transform.getProperty()] = 'translate3d(0, -' + ($window.innerWidth-photoGap) + 'px, 0)';
            element[0].style.height = ($window.innerHeight - MINIHEADERHEIGHT - photoGap) + 'px';

            scope.nonScrollable = true;
            scope.nonSwipeable = true;

            scope.$emit('item.toggleDescriptionOpen', true);
          }
        }
      };

      scope.closeDescription = function(){
        element[0].style[Transform.getProperty()] = 'translate3d(0, 0, 0)';

        scope.nonScrollable = false;
        scope.nonSwipeable = false;

        scope.$emit('item.toggleDescriptionOpen', false);
      };
    },
    template: '<div class="item-description" non-swipeable><button type="button" class="close" ng-click="closeDescription()" non-swipeable>&times;</button><hr/><p ng-click="expandDescription(item.id)" non-swipeable>{{item.description}}</p></div>'
  };
});