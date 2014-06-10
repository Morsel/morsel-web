angular.module('Morsel.common.morsel', [])

.directive('mrslMorsel', [function() {
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
    },
    templateUrl: 'common/swipe/morsel.tpl.html'
  };
}]);