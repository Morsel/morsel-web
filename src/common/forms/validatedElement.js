angular.module('Morsel.common.validatedElement', [])

.directive('mrslValidatedElement', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      inForm: '=mrslValForm',
      type: '@mrslValType',
      enName: '@mrslValEnName',
      inputName: '@mrslValName',
      required: '@mrslValRequired',
      placeholder: '@mrslValPlaceholder',
      formModel: '=mrslValFormModel',
      customVal: '=mrslValCustom',
      tagType: '@mrslValTagType',
      multipleVals: '=mrslValMultipleVals',
      helpText: '@mrslValHelpText',
      labelBtns: '@mrslValLabelBtns',//display checkboxes, radios as buttons,
      isDisabled: '=mrslValDisabled',
      focus: '=mrslValFocus',
      blur: '=mrslValBlur',
      hideLabel: '=mrslValHideLabel'
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
            case 'length':
              var lengthSettings = scope.customVal['length'];

              setupLengthWatch(lengthSettings);

              if(lengthSettings.message) {
                if(lengthSettings.min) {
                  scope.builtInErrorMessages['lengthMin'] = lengthSettings.message;
                }
                if(lengthSettings.max) {
                  scope.builtInErrorMessages['lengthMax'] = lengthSettings.message;
                }
              }
          }
        }
      }

      //handle values from custom matching validation
      function handleMatch(value) {
        if(value) {
          scope.inForm[scope.inputName].$setValidity('match', value[0] === value[1] );
        }
      }

      function setupLengthWatch(lengthSettings) {
        scope.$watch('formModel[inputName]', function(value){
          handleLength(value, lengthSettings);
        }, true);
      }

      //handle values from custom length validation
      function handleLength(value, lengthSettings) {
        if(lengthSettings.min) {
          if(value) {
            scope.inForm[scope.inputName].$setValidity('lengthMin', value.length >= lengthSettings.min );
          } else {
            //if there isn't a value, it's too short
            scope.inForm[scope.inputName].$setValidity('lengthMin', true);
          }
        }

        if(lengthSettings.max) {
          if(value) {
            scope.inForm[scope.inputName].$setValidity('lengthMax', value.length <= lengthSettings.max );
          } else {
            //if there isn't a value, it isn't too long
            scope.inForm[scope.inputName].$setValidity('lengthMax', true);
          }
        }
      }
    },
    templateUrl: function(tElement, tAttrs) {
      var templateRoot = 'common/forms/validated',
          templateMid = 'Input', //assume input if not specified
          templateEnd = '.tpl.html';

      //figure out which template to load and use
      if(tAttrs.mrslValTagType === 'textarea') {
        templateMid = 'Textarea';
      } else if(tAttrs.mrslValTagType === 'radio') {
        templateMid = 'Radio';
      } else if(tAttrs.mrslValTagType === 'checkbox') {
        templateMid = 'Checkbox';
      } else if(tAttrs.mrslValTagType === 'single-checkbox') {
        templateMid = 'SingleCheckbox';
      }
      
      return templateRoot + templateMid + templateEnd;
    }
  };
});