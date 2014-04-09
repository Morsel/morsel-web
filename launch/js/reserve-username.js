$(function(){
  var $welcome = $('#home-welcome'),
      $step1 = $welcome.find('#welcome-step-1'),
      $step2 = $welcome.find('#welcome-step-2'),
      $step3 = $welcome.find('#welcome-step-3'),
      $step4 = $welcome.find('#welcome-step-4'),
      $yourUsername = $welcome.find('.your-username'),
      userId;

  $step1.on('submit', 'form', function(e) {
    var $form = $(this),
        $formInputs = $form.find('input:visible'),
        $username = $form.find('#username');

    e.preventDefault();

    hideErrors($form, $formInputs);

    if($username.val().length) {
      sendMixpanel('Tapped Check Username Availability');

      $.ajax({
        url: Morsel.apiURL+'/users/checkusername.json',
        data: serializePlusUtmz($form)
      }).then(function(resp){
        if(resp.data === 'true') {
          //returned true - username already exists
          hideErrors($form, $formInputs);
          showErrors($username, 'Username already exists. Please choose another');
        } else {
          //returned false - username available
          //show name on page and put in hidden inputs
          $yourUsername.text($username.val());
          $welcome.find('#your-username-input').val($username.val());

          //move on
          $step1.removeClass('current-step');
          $step2.addClass('current-step').find('input:visible').first().focus();
        }
      }).fail(function(resp){
        hideErrors($form, $formInputs);

        if(resp.responseJSON && resp.responseJSON.errors) {
          //we've got errors
          hideErrors($form, $formInputs);
          showErrors($username, resp.responseJSON.errors);
        } else {
          //show a generic error
          showErrors($username, 'Oops, something went wrong. Please try again');
        }
      });

      $formInputs.attr('disabled', 'disabled');
    } else {
      showErrors($username, 'Please type a username');
    }
  });

  $step2.on('submit', 'form', function(e) {
    var $form = $(this),
        $formInputs = $form.find('input:visible'),
        $email = $form.find('#email');

    e.preventDefault();

    hideErrors($form, $formInputs);

    if($email.val().length) {
      sendMixpanel('Tapped Reserve Username');

      $.ajax({
        url: Morsel.apiURL+'/users/reserveusername.json',
        type: 'POST',
        data: serializePlusUtmz($form)
      }).then(function(resp){
        //save id
        userId = resp.data.user_id;
        
        $step2.removeClass('current-step');
        $step3.addClass('current-step');
      }).fail(function(resp){
        hideErrors($form, $formInputs);

        if(resp.responseJSON && resp.responseJSON.errors) {
          //we've got errors
          hideErrors($form, $formInputs);
          showErrors($email, resp.responseJSON.errors);
        } else {
          //show a generic error
          showErrors($email, 'Oops, something went wrong. Please try again');
        }
      });

      $formInputs.attr('disabled', 'disabled');
    } else {
      showErrors($email, 'Please type your email');
    }
  });

  $step3.on('click', 'input[type="radio"]', function(e) {
    var $form = $(this).closest('form'),
        $labels = $form.find('label'),
        $formInputs = $form.find('input');

    e.preventDefault();

    hideErrors($form, $formInputs);
    
    sendMixpanel('Tapped User Industry', {
      industry: $formInputs.val()
    });

    $.ajax({
      url: Morsel.apiURL+'/users/'+userId+'/updateindustry.json',
      type: 'PUT',
      data: serializePlusUtmz($form)
    }).then(function(resp){
      $step3.removeClass('current-step');
      $step4.addClass('current-step');
    }).fail(function(resp){
      hideErrors($form, $formInputs);
      $labels.removeClass('disabled');

      if(resp.responseJSON && resp.responseJSON.errors) {
        //we've got errors
        hideErrors($form, $formInputs);
        showErrors($labels.last(), resp.responseJSON.errors);
      } else {
        //show a generic error
        showErrors($labels.last(), 'Oops, something went wrong. Please try again');
      }
    });

    $formInputs.attr('disabled', 'disabled');
    $labels.addClass('disabled');
  });


  $('#facebook-share').on('click', function() {
    sendMixpanel('Tapped Share Username on Social', {
      social_type: 'Facebook'
    });
  });

  $('#twitter-share').on('click', function() {
    sendMixpanel('Tapped Share Username on Social', {
      social_type: 'Twitter'
    });
  });

  function showErrors($input, errors) {
    var serverErrors,
        fieldName,
        fnEnglish,
        i;

    $input.addClass('error');

    //if it's a string, local error. just print
    if(typeof(errors)==='string') {
      $input.after('<p class="error">'+errors+'</p>');

      sendMixpanel('Displayed Alert to User', {
        message: errors
      });
    } else {
      //go through and construct
      for (fieldName in errors) {
        //we need an english phrase for the field name
        fnEnglish = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/ /g,"_");
        //get the errors for this field
        serverErrors = errors[fieldName];

        //make good english
        for(i=0; i<serverErrors.length; i++) {
          $input.after('<p class="error">'+fnEnglish+' '+serverErrors[i]+'</p>');

          sendMixpanel('Displayed Alert to User', {
            message: fnEnglish+' '+serverErrors[i]
          });
        }
      }
    }

    $input.focus();
  }

  function hideErrors($form, $formInputs) {
    $form.find('p.error').remove();
    $formInputs.removeAttr('disabled');
    $formInputs.removeClass('error');
  }

  function readCookie(cname){
    var name = cname + "=",
        ca = document.cookie.split(';');

    for(var i=0; i<ca.length; i++) {
      var c = ca[i].trim();

      if (c.indexOf(name)==0) {
        return c.substring(name.length,c.length);
      }
    }
    return "";
  }

  function serializePlusUtmz($form) {
    var serialized = $form.serialize(),
        utmz = readCookie('__utmz');

    if(utmz) {
      serialized += '&__utmz='+encodeURIComponent(utmz);
    }

    return serialized;
  }

  function sendMixpanel(e, props) {
    var dProps = {
      client_device: 'web',
      client_version: '0.0',
      $screen_width: window.innerWidth,
      $screen_height: window.innerHeight,
      view: 'claim_username'
    };

    if(mixpanel) {
      if(props) {
        dProps = $.extend(dProps, props);
      }

      if(userId) {
        dProps = $.extend(dProps, {
          user_id : userId
        });
      }

      mixpanel.track(e, dProps); 
    }
  }
});