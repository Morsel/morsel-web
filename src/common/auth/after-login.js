angular.module( 'Morsel.common.afterLogin', [])

//things to be completed after a successful login/registration
.factory('AfterLogin', function($location, $window) {
  /* a callback object of the following format to be read upon login:
   * {
   *   path: '/some/path', //path to redirect to
   *   type: 'like', //namespace of afterlogin event for code to check
   *   data: {
   *     arbitrary: 'object' //data to be used on callback
   *   }
   * }
   */
  var callback;

  fetchCallback();

  function fetchCallback() {
    callback = $window.sessionStorage.afterlogin;

    if(callback) {
      callback = JSON.parse(callback);
    }
  }

  return {
    getCallback: function() {
      return callback;
    },
    hasCallback: function(type) {
      //if looking for a certain type of callback
      if(type && callback) {
        return callback.type === type;
      } else {
        //just looking for any callback
        return callback ? true : false;
      }
    },
    setCallback: function(callbackObj) {
      $window.sessionStorage.afterlogin = JSON.stringify(callbackObj);
      fetchCallback();
    },
    goToCallbackPath: function() {
      if(callback.path) {
        $window.location.href = callback.path;
      } else {
        //oops, missing a path, just go to feed
        $window.location.href = '/feed';
      }
    },
    removeCallback: function() {
      //unset our callback
      callback = null;
      if($window.sessionStorage.afterlogin) {
        delete $window.sessionStorage.afterlogin;
      }
    }
  };
});