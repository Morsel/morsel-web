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
        var confirmed = confirm('Are you sure you want to delete this item?');

        scope.deletingItem = true;

        if(confirmed) {
          ApiItems.deleteItem(scope.item.id).then(function() {
            //tell morsel to remove item
            scope.$emit('add.item.delete', scope.item.id);
          }, function(resp) {
            scope.deletingItem = false;
            HandleErrors.onError(resp.data, scope.form);
          });
        } else {
          scope.deletingItem = false;
        }
      };
    },
    templateUrl: 'app/add/morsel/item/item.tpl.html'
  };
});