angular.module( 'Morsel.itemActionBar', [] )

//a holder for actions performed on an item
.directive('mrslItemActionBar', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      item: '=mrslActionableItem',
      items: '=mrslItems',
      index: '=mrsItems'
    },
    link: function(scope, element, attrs) {
      scope.nonSwipeable = true;
    },
    templateUrl: 'itemActions/itemActionBar.tpl.html'
  };
});