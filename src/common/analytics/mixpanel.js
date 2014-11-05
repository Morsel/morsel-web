angular.module( 'Morsel.common.mixpanel', [])

//handle sending mixpanel events
.factory('Mixpanel', function() {
  var baseSuperProps = {
      client_device: 'web',
      client_version: MorselConfig.version,
      $screen_width: window.innerWidth,
      $screen_height: window.innerHeight
    },
    superProps = {},
    userId;

  //update some configs
  if(window.mixpanel) {
    window.mixpanel.set_config({
      cookie_name: 'mrsl_mixpanel',
      secure_cookie: true
    });
  }
  
  return {
    send : function(e, customProps, callback) {
      var loggingProps;
      
      if(window.mixpanel) {
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
      if(window.mixpanel) {
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

      if(window.mixpanel) {
        window.mixpanel.register(superProps);
      } else {
        console.log('Mixpanel Register: ', superProps);
      }
    },
    identify : function(id) {
      userId = id;

      if(window.mixpanel) {
        window.mixpanel.identify(userId);
      } else {
        console.log('Mixpanel Identify: ', userId);
      }
    },
    alias : function(id) {
      userId = id;

      if(window.mixpanel) {
        window.mixpanel.alias(userId);
      } else {
        console.log('Mixpanel Alias: ', userId);
      }
    }
  };
});