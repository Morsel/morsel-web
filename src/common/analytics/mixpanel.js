angular.module( 'Morsel.common.mixpanel', [])

.constant('MIXPANEL_ENABLED', true)

//handle sending mixpanel events
.factory('Mixpanel', function(MIXPANEL_ENABLED) {
  var baseSuperProps = {
      client_device: 'web',
      client_version: MorselConfig.version,
      $screen_width: window.innerWidth,
      $screen_height: window.innerHeight
    },
    superProps = {},
    userId,
    usingMixpanel = window.mixpanel && MIXPANEL_ENABLED;

  //update some configs
  if(usingMixpanel) {
    window.mixpanel.set_config({
      cookie_name: 'mrsl_mixpanel',
      secure_cookie: true,
      cookie_expiration: 3650
    });
  }

  return {
    track : function(e, customProps, callback) {
      var loggingProps;
      
      if(usingMixpanel) {
        window.mixpanel.track(e, customProps, callback); 
      } else {
        //combine all our mixpanel props (super + regular) for logging
        loggingProps = _.defaults(customProps || {}, superProps);
        _.extend(loggingProps, {
          userId: userId
        });
        console.log('Mixpanel Event: ', e, loggingProps);
        callback();
      }
    },
    track_links : function(selector, eventName, customProps) {
      if(usingMixpanel) {
        window.mixpanel.track_links(selector, eventName, customProps);
      } else {
        console.log('Setting up track_links event: '+eventName+' on: '+ selector);
      }
    },
    register : function(customSuperProps) {
      //add new custom props to existing supers
      superProps = _.defaults(customSuperProps || {}, superProps);
      //fill in any base props
      superProps = _.defaults(superProps, baseSuperProps);

      if(usingMixpanel) {
        window.mixpanel.register(superProps);
      } else {
        console.log('Mixpanel Register: ', superProps);
      }
    },
    identify : function(id) {
      userId = id;

      if(usingMixpanel) {
        window.mixpanel.identify(userId);
      } else {
        console.log('Mixpanel Identify: ', userId);
      }
    },
    alias : function(id) {
      userId = id;

      if(usingMixpanel) {
        window.mixpanel.alias(userId);
      } else {
        console.log('Mixpanel Alias: ', userId);
      }
    },
    people : {
      set : function(props, callback) {
        if(usingMixpanel) {
          window.mixpanel.people.set(props, callback);
        } else {
          console.log('Mixpanel Set people: ', props);
        }
      }
    }
  };
});