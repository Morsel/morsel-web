angular.module( 'Morsel.handleErrors', [] )

.factory('HandleErrors', function(Mixpanel, Auth) {
  var HandleErrors = {};

  HandleErrors.onError = function(resp, form) {
    var fieldName,
        fnEnglish,
        serverErrors,
        i;

    if(resp.data.errors) {
      //go through each type of error
      for (fieldName in resp.data.errors) {
        if(form[fieldName]) {
          //must be associated with a specific input

          //we need an english phrase for the field name
          fnEnglish = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/ /g,"_");
          //get the errors for this field
          serverErrors = resp.data.errors[fieldName];

          //make good english
          for(i=0; i<serverErrors.length; i++) {
            serverErrors[i] = fnEnglish+' '+serverErrors[i];
          }

          //set field as invalid
          form[fieldName].$setValidity('server', false, form);
          //put errors in model
          form[fieldName].$error.serverErrors = serverErrors;
        } else {
          //this is either a generic form error, an API error, or catching mismatched input
          //get the errors for this field
          serverErrors = resp.data.errors[fieldName];

          //capitalize first letter
          for(i=0; i<serverErrors.length; i++) {
            //generic error
            if(fieldName === 'base') {
              serverErrors[i] = serverErrors[i].charAt(0).toUpperCase() + serverErrors[i].slice(1);
            } else if(fieldName === 'api') {
              //something's wrong on the API side, possibly not related to client input
              Auth.showApiError(resp.status, serverErrors[i]);
            } else {
              //misplaced input - make good english
              for(i=0; i<serverErrors.length; i++) {
                serverErrors[i] = fnEnglish+' '+serverErrors[i];
              }
            }
          }

          //put errors in model
          form.$error.serverErrors = serverErrors;
          //don't set our form as invalid on a server error - user could have perfectly valid inputs
        }

        Mixpanel.send('Displayed Alert to User', {
          error_message : serverErrors
        });
      }
    }
  };

  return HandleErrors;
});