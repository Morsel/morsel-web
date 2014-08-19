angular.module( 'Morsel.common.rollbar', [])

//handle sending Rollbar error reports
.factory('RollbarFactory', function() {
  return {
    configure : {
      person : function(personData) {
        if(window.Rollbar && personData) {
          Rollbar.configure({
            payload: {
              person : {
                id: personData.id,
                username: personData.username,
                email: personData.email,
                professional: personData.professional
              }
            }
          });
        }
      }
    },
    error : function(exception) {
      if(window.Rollbar) {
        Rollbar.error('Error: '+exception.message, exception);
      }
    }
  };
});