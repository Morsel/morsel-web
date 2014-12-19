angular.module('Morsel.add.editMorselSummary', [])

.directive('mrslEditMorselSummary', function(ApiMorsels) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslEditMorselSummary'
    },
    link: function(scope, element, attrs) {
      scope.editing = false;

      //this will be our model
      scope.updatedSummary = scope.morsel.summary;

      scope.placeholder = 'Morsel summary placeholder text';

      scope.edit = function(){
        scope.editing = true;
        scope.morselSummaryForm.morselSummary.$setValidity('morselSummarySaved', false);
        //set "$dirty" for onbeforeunload
        scope.$emit('add.dirty', {
          key: 'morselSummary',
          value: true
        });
      };

      scope.cancel = function(){
        scope.updatedSummary = scope.morsel.summary;
        scope.editing = false;
        scope.morselSummaryForm.morselSummary.$setValidity('morselSummarySaved', true);
        //set "$pristine" for onbeforeunload
        scope.$emit('add.dirty', {
          key: 'morselSummary',
          value: false
        });
      };

      scope.save = function(e) {
        //treat null summaries as empty strings so we don't bother updating null values with blanks
        var newSummary = scope.updatedSummary ? scope.updatedSummary.trim() : null,
            oldSummary = scope.morsel.summary ? scope.morsel.summary : null,
            morselParams = {
              morsel: {
                summary: newSummary
              }
            };

        //need to prevent this from bubbling up and submitting our main form
        e.preventDefault();

        scope.saving = true;

        //check if anything changed before hitting API 
        if(newSummary === oldSummary) {
          scope.editing = false;
          scope.morselSummaryForm.morselSummary.$setValidity('morselSummarySaved', true);
          //set "$pristine" for onbeforeunload
          scope.$emit('add.dirty', {
            key: 'morselSummary',
            value: false
          });
          scope.saving = false;
        } else {
          ApiMorsels.updateMorsel(scope.morsel.id, morselParams).then(function() {
            //set our local model
            scope.morsel.summary = scope.updatedSummary.trim();
            scope.editing = false;
            scope.morselSummaryForm.morselSummary.$setValidity('morselSummarySaved', true);
            //set "$pristine" for onbeforeunload
            scope.$emit('add.dirty', {
              key: 'morselSummary',
              value: false
            });
            scope.saving = false;
          }, function(resp) {
            scope.saving = false;
            scope.$emit('add.error', resp);
          });
        }
      };
    },
    templateUrl: 'app/add/morsel/editMorselSummary.tpl.html'
  };
});