angular.module('Morsel.add.editItemDescription', [])

.directive('mrslEditItemDescription', function(ApiItems) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      item: '=mrslEditItemDescription'
    },
    link: function(scope, element, attrs) {
      //determine what to show for the placeholder
      scope.placeholder = (scope.item.displayTemplate && scope.item.displayTemplate.placeholder_description) ? scope.item.displayTemplate.placeholder_description : 'Enter a description here';

      scope.editing = false;
      //this will be our model
      scope.updatedText = scope.item.description;

      scope.edit = function(){
        scope.editing = true;
        scope.itemDescriptionForm.itemDescription.$setValidity('saved', false);
      };

      scope.cancel = function(){
        scope.updatedText = scope.item.description;
        scope.editing = false;
        scope.itemDescriptionForm.itemDescription.$setValidity('saved', true);
      };

      scope.save = function() {
        var itemParams = {
          item: {
            description: scope.updatedText
          }
        };

        ApiItems.updateItem(scope.item.id, itemParams).then(function() {
          //set our local model
          scope.item.description = scope.updatedText;
          scope.editing = false;
          scope.itemDescriptionForm.itemDescription.$setValidity('saved', true);
        }, function(resp) {
          scope.$emit('add.error', resp);
        });
      };
    },
    templateUrl: 'app/add/morsel/itemDescription.tpl.html'
  };
});