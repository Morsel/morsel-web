angular.module('Morsel.common.morselSummary', [])

.directive('mrslMorselSummary', function($window, PhotoHelpers, MORSELPLACEHOLDER) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorselSummary',
      morselFeedItemId: '=mrslFeedItemId'
    },
    link: function(scope) {},
    templateUrl: 'common/morsels/morsel-summary.tpl.html'
  };
});