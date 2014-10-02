angular.module('Morsel.add.editItemDescription', [])

.directive('mrslEditItemDescription', function(ApiItems) {
  return {
    restrict: 'A',
    replace: true,
    scope: false,
    link: function(scope, element, attrs) {
      //determine what to show for the placeholder
      scope.placeholderDescription = (scope.item.displayTemplate && scope.item.displayTemplate.placeholder_description) ? scope.item.displayTemplate.placeholder_description : 'Enter a description here';

      scope.editingDescription = false;
      //this will be our model
      scope.updatedDescription = scope.item.description;

      scope.edit = function(){
        scope.editingDescription = true;
        scope.itemDescriptionForm.itemDescription.$setValidity('itemDescriptionSaved', false);
      };

      scope.cancel = function(){
        scope.updatedDescription = scope.item.description;
        scope.editingDescription = false;
        scope.itemDescriptionForm.itemDescription.$setValidity('itemDescriptionSaved', true);
      };

      scope.save = function() {
        var itemParams = {
          item: {
            description: scope.updatedDescription
          }
        };

        ApiItems.updateItem(scope.item.id, itemParams).then(function() {
          //set our local model
          scope.item.description = scope.updatedDescription;
          scope.editingDescription = false;
          scope.itemDescriptionForm.itemDescription.$setValidity('itemDescriptionSaved', true);
        }, function(resp) {
          scope.$emit('add.error', resp);
        });
      };
      
      scope.formatDescription = function() {
        if(scope.item && scope.item.description) {
          return scope.item.description.replace(/(\r\n|\n|\r)/g,"<br />");
        } else {
          return null;
        }
      };
    },
    templateUrl: 'app/add/morsel/item/itemDescription.tpl.html'
  };
});