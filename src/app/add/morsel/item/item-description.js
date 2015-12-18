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
        //set "$dirty" for onbeforeunload
        scope.$emit('add.dirty', {
          key: 'itemDescription_'+scope.item.id,
          value: true
        });
      };

      scope.cancel = function(){
        scope.updatedDescription = scope.item.description;
        scope.editingDescription = false;
        scope.itemDescriptionForm.itemDescription.$setValidity('itemDescriptionSaved', true);
        //set "$pristine" for onbeforeunload
        scope.$emit('add.dirty', {
          key: 'itemDescription_'+scope.item.id,
          value: false
        });
      };

      scope.save = function() {
        //treat null descriptions as empty strings so we don't bother updating null values with blanks
        var newDescription = scope.updatedDescription ? scope.updatedDescription.trim() : '',
            oldDescription = scope.item.description ? scope.item.description : '',
            itemParams = {
              item: {
                description: newDescription
              }
            };

        scope.saving = true;

        //check if anything changed before hitting API
        if(newDescription === oldDescription) {
          scope.editingDescription = false;
          scope.itemDescriptionForm.itemDescription.$setValidity('itemDescriptionSaved', true);
          //set "$pristine" for onbeforeunload
          scope.$emit('add.dirty', {
            key: 'itemDescription_'+scope.item.id,
            value: false
          });
          scope.saving = false;
        } else {
          ApiItems.updateItem(scope.item.id, itemParams).then(function() {
            //set our local model
            scope.item.description = newDescription;
            scope.editingDescription = false;
            scope.itemDescriptionForm.itemDescription.$setValidity('itemDescriptionSaved', true);
            //set "$pristine" for onbeforeunload
            scope.$emit('add.dirty', {
              key: 'itemDescription_'+scope.item.id,
              value: false
            });
            scope.saving = false;
          }, function(resp) {
            scope.saving = false;
            scope.$emit('add.error', resp);
          });
        }
      };

      scope.formatDescription = function() {
        if(scope.item && scope.item.description) {
          //return scope.item.description.replace(/(\r\n|\n|\r)/g,"<br />");
          return scope.item.description.replace(/(\r\n|\n|\r)/g,"");
        } else {
          return null;
        }
      };
    },
    templateUrl: 'app/add/morsel/item/item-description.tpl.html'
  };
});
