angular.module( 'Morsel.login.admin', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'admin', {
    url: '/admin/shadow?user_id&shadow_token',
    views: {
      "main": {
        controller: 'AdminCtrl',
        template: '<div class="loader"></div>'
      }
    }
  });
})

.controller( 'AdminCtrl', function ReservedUsernameCtrl( $scope, $stateParams, Auth, $window, localStorageService, Mixpanel ) {
  if($stateParams.user_id && $stateParams.shadow_token) {
    //log out existing user
    Auth.logout(true);

    Auth.login({
      'user_id': $stateParams.user_id,
      'shadow_token': $stateParams.shadow_token
    }).then(onSuccess, onError);
  } else {
    //if we don't have these, go home
    $window.location.href = '/';
  }

  function onSuccess(resp) {
    $window.alert('Logging in as '+resp.first_name.toUpperCase() + ' '+resp.last_name.toUpperCase()+'. Please don\'t do anything '+resp.first_name + ' '+resp.last_name+'\'s grandma wouldn\'t approve of.');

    //store that we're a shadow user until we log out
    Auth.setShadowUser();

    //track that we logged in as a shadow user
    Mixpanel.track('Logged in', {
      login_type: 'shadow'
    }, function() {
      $window.location.href='/add/drafts';
    });
  }

  function onError() {
    $window.alert('There was a problem logging in as user_id='+$stateParams.user_id+'. Please try again.');
  }
});