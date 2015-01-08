angular.module('Morsel.common.morselGrid', [])

.directive('mrslMorselGrid', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsels: '=mrslMorselGrid',
      viewMoreFunc: '=mrslMorselGridViewMoreFunc',
      emptyText: '=mrslMorselGridEmptyText',
      morselView: '=mrslMorselGridView'
    },
    link: function(scope, element) {
    },
    templateUrl: 'common/morsels/morsel-grid.tpl.html'
  };
});