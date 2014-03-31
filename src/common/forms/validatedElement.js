angular.module('Morsel.validatedElement', [])

.directive('validatedElement', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      inForm: '=valForm',
      type: '@valType',
      enName: '@valEnName',
      inputName: '@valName',
      required: '@valRequired',
      placeholder: '@valPlaceholder',
      formModel: '=valFormModel',
      customVal: '=valCustom',
      tagType: '@valTagType',
      radioVals: '=valRadioVals',
      helpText: '@valHelpText'
    },
    link: function(scope, element, attrs) {
      var customValType;

      scope.builtInErrorMessages = {
        'required': scope.enName + ' is required'
      };

      scope.builtInErrorMessages[scope.inputName] = scope.enName + ' is invalid';

      //to be called onchange so we don't prevent form submit for server errors
      scope.removeServerError = function() {
        scope.inForm[scope.inputName].$setValidity('server', true, scope.inForm);
      };

      //check if there's anything on the client side
      scope.hasClientError = function(){
        return _.filter(scope.inForm[scope.inputName].$error, function(errorList, errorType) {
          //server errors don't count towards client errors
          if(errorType === 'server' || errorType === 'serverErrors') {
            return false;
          } else {
            //return the value
            return errorList;
          }
        }).length > 0;
      };

      //apply our custom validation, if any
      if(scope.customVal) {
        for(customValType in scope.customVal) {
          switch(customValType) {
            //used to make sure an input matches value of another input 
            case 'match':
              var matchSettings = scope.customVal['match'];
              scope.$watch('[formModel[\''+matchSettings.matches+'\'], formModel[inputName]]', handleMatch, true);
              
              if(matchSettings.message) {
                scope.builtInErrorMessages['match'] = matchSettings.message;
              }
              break;
          }
        }
      }

      //handle values from custom matching validation
      function handleMatch(value) {
        if(value) {
          scope.inForm[scope.inputName].$setValidity('match', value[0] === value[1] );
        }
      }
    },
    templateUrl: function(tElement, tAttrs) {
      var templateRoot = 'forms/validated',
          templateMid = 'Input', //assume input if not specified
          templateEnd = '.tpl.html';

      //figure out which template to load and use
      if(tAttrs.valTagType === 'textarea') {
        templateMid = 'Textarea';
      } else if(tAttrs.valTagType === 'radio') {
        templateMid = 'Radio';
      }
      
      return templateRoot + templateMid + templateEnd;
    }
  };
});