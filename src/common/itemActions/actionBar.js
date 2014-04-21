angular.module( 'Morsel.itemActionBar', [] )

//a holder for actions performed on an item
.directive('itemActionBar', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      item: '=actionableItem',
      items: '=',
      index: '='
    },
    link: function(scope, element, attrs) {
      scope.nonSwipeable = true;
    },
    templateUrl: 'itemActions/itemActionBar.tpl.html'
  };
});