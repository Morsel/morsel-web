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

.directive('mrslItemDescription', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      item: '=mrslItemDescription'
    },
    link: function(scope, element) {
      scope.formatDescription = function() {
        if(scope.item && scope.item.description) {
          return scope.item.description.replace(/(\r\n|\n|\r)/g,"<br />");
        } else {
          return '';
        }
      };
    },
    template: '<div class="item-description"><p ng-bind-html="formatDescription()"></p></div>'
  };
});