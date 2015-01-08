angular.module( 'Morsel.common.itemActionBar', [] )

//a holder for actions performed on an item
.directive('mrslItemActionBar', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      item: '=mrslItem',
      items: '=mrslItems',
      index: '=mrslIndex'
    },
    link: function(scope, element, attrs) {
    },
    templateUrl: 'common/itemActions/itemActionBar.tpl.html'
  };
});