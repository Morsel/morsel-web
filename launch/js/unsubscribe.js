$(function(){
  var email = $.url().param('md_email');

  if(email) {
    $('#unsubscribe-text').text(email+' has been unsubscribed from all Morsel emails');

    $.ajax({
      url: Morsel.apiURL+'/users/unsubscribe.json',
      type: 'POST',
      data: {
        'email': email
      }
    }).always(function(resp){
      $('body').addClass('unsubscribed');
    });
  } else {
    $('body').addClass('unsubscribed');
    $('#unsubscribe-text').text('Please click an unsubscribe link in your email');
  }
});