angular.module('Morsel.common.submitBtn', [])

.directive('mrslSubmitBtn', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      form: '=mrslSubmitBtnForm',
      copy: '@mrslSubmitBtnCopy',
      btnBlock: '@mrslSubmitBtnBlock',
      tooltipPlacement: '@mrslSubmitBtnTooltipPlacement',
      customMessages: '=mrslSubmitBtnCustomMessages'
    },
    link: function(scope) {
      var originalCopy = scope.copy;

      scope.toolTipMessage = function(){
        if(scope.form.$error.loading) {
          return 'Your request is loading...';
        } else if(scope.form.$error.required) {
          return 'Please complete all required fields';
        } else {
          //check custom messages
          return getCustomMessage() || 'Please correct errors in indicated fields';
        }
      };

      scope.copyMessage = function(){
        if(scope.form.$error.loading) {
          return 'Loading...';
        } else {
          return originalCopy;
        }
      };

      function getCustomMessage() {
        var validError;

        if(_.isEmpty(scope.customMessages)) {
          return false;
        } else {
          //check our potential errors
          validError = _.find(scope.customMessages, function(cm){
            //if the form has one present, return the message for it
            if(cm.errorName && scope.form.$error[cm.errorName]) {
              return true;
            }
          });

          return validError ? validError.message : false;
        }
      }
    },
    templateUrl: 'common/forms/submitBtn.tpl.html'
  };
}]);