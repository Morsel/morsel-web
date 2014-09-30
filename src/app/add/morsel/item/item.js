angular.module( 'Morsel.add.item', [])

.directive('mrslEditItem', function(ApiItems) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      item: '=mrslEditItem'
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
            scope.$emit('add.error', resp);
          });
        } else {
          scope.deletingItem = false;
        }
      };

      scope.makeCoverPhoto = function() {
        //don't waste an api call - make sure it's not already the primary
        if(scope.item.id != scope.item.morsel.primary_item_id) {
          scope.$emit('add.item.makeCoverPhoto', scope.item.id);
        }
      };
    },
    templateUrl: 'app/add/morsel/item/item.tpl.html'
  };
});