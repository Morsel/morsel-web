angular.module('Morsel.common.morselGrid', [])

.directive('mrslMorselGrid', function(MORSEL_LIST_NUMBER) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsels: '=mrslMorselGrid',
      viewMoreFunc: '=mrslMorselGridViewMoreFunc',
      emptyText: '=mrslMorselGridEmptyText'
    },
    link: function(scope, element) {
      scope.morselIncrement = MORSEL_LIST_NUMBER;
    },
    templateUrl: 'common/morsels/morselGrid.tpl.html'
  };
});