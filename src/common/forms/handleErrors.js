angular.module( 'Morsel.handleErrors', [] )

.factory('HandleErrors', function() {
  var HandleErrors = {};

  HandleErrors.onError = function(resp, form) {
    var fieldName,
        fnEnglish,
        serverErrors,
        i;

    if(resp.data.errors) {
      //go through each type of error
      for (fieldName in resp.data.errors) {
        //we need an english phrase for the field name
        fnEnglish = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/ /g,"_");
        //get the errors for this field
        serverErrors = resp.data.errors[fieldName];

        //make good english
        for(i=0; i<serverErrors.length; i++) {
          serverErrors[i] = fnEnglish+' '+serverErrors[i];
        }

        //make sure there's a field associated with it
        if(form[fieldName]) {
          //set field as invalid
          form[fieldName].$setValidity('server', false, form);
          //put errors in model
          form[fieldName].$error.serverErrors = serverErrors;
        }
      }
    }
  };

  return HandleErrors;
});