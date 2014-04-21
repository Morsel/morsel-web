angular.module( 'Morsel.mixpanel', [])

//handle sending mixpanel events
.factory('Mixpanel', function(Auth) {
  var standardProps = {
      client_device: 'web',
      client_version: MorselConfig.version,
      $screen_width: window.innerWidth,
      $screen_height: window.innerHeight,
      is_staff: Auth.isStaff()
    };
  
  return {
    send : function(e, customProps) {
      var props = _.defaults(customProps || {}, standardProps),
          userId;

      if(Auth.hasCurrentUser()) {
        userId = Auth.getCurrentUser()['id'];

        _.extend(props, {
          user_id : userId
        });
      }

      _.extend(props, {
        is_staff : Auth.isStaff()
      });
      
      if(window.mixpanel) {
        window.mixpanel.track(e, props); 
      } else {
        console.log('Mixpanel Event: ', e, props);
      }
    }
  };
});