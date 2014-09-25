angular.module('Morsel.common.submitBtn', [])

.directive('mrslSubmitBtn', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      form: '=mrslSubmitBtnForm',
      copy: '@mrslSubmitBtnCopy',
      btnBlock: '@mrslSubmitBtnBlock',
      tooltipPlacement: '@mrslSubmitBtnTooltipPlacement'
    },
    link: function(scope) {
      var originalCopy = scope.copy;

      scope.toolTipMessage = function(){
        if(scope.form.$error.loading) {
          return 'Your request is loading...';
        } else if(scope.form.$error.required) {
          return 'Please complete all required fields';
        } else if(scope.form.$error.itemDescriptionSaved) {
          return 'All descriptions must be saved before continuing';
        } else if(scope.form.$error.itemPhotoDoneUploading) {
          return 'Images are still uploading. Please try again shortly';
        } else {
          return 'Please correct errors in indicated fields';
        }
      };

      scope.copyMessage = function(){
        if(scope.form.$error.loading) {
          return 'Loading...';
        } else {
          return originalCopy;
        }
      };
    },
    templateUrl: 'common/forms/submitBtn.tpl.html'
  };
}]);