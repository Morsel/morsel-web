angular.module( 'Morsel.add.item', [])

.directive('mrslEditItem', function(ApiItems, HandleErrors) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      item: '=mrslEditItem',
      form: '=mrslEditItemForm'
    },
    link: function(scope, element, attrs) {
      scope.deleteItem = function() {
        scope.deletingItem = true;

        ApiItems.deleteItem(scope.item.id).then(function() {
          delete scope.item;
        }, function() {
          scope.deletingItem = false;
          HandleErrors.onError(resp.data, scope.form);
        });
      };
    },
    templateUrl: 'app/add/morsel/item/item.tpl.html'
  };
});