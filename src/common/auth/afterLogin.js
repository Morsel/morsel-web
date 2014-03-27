angular.module( 'Morsel.afterLogin', [])

//things to be completed after a successful login/registration
.factory('AfterLogin', function($location) {
  var info = {
        //an array of callback functions to be completed when logged in
        callbacks: []
      };
  
  return {
    callbacks: function() {
      return info.callbacks;
    },
    hasCallbacks: function() {
      return info.callbacks.length > 0;
    },
    addCallbacks: function() {
      for (var i = 0; i < arguments.length; i++) {
        //add callback to the beginning of the array, so we can work backwards and pop off completed tasks
        info.callbacks.unshift(arguments[i]);
      }
    },
    executeCallbacks: function() {
      var i = info.callbacks.length - 1;

      for (i; i >= 0; i--) {
        //execute last callback
        info.callbacks[i]();
        //pop it off
        info.callbacks.pop();
      }
    }
  };
});