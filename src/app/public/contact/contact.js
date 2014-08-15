angular.module( 'Morsel.public.contact', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'contact', {
    url: '/contact',
    views: {
      "main": {
        controller: 'ContactCtrl',
        templateUrl: 'app/public/contact/contact.tpl.html'
      }
    },
    data:{ pageTitle: 'Contact Us' },
    resolve: {
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

// .controller( 'ContactCtrl', function ContactCtrl( $scope, ApiUtil, HandleErrors, $timeout, currentUser, $location ) {
.controller( 'ContactCtrl', function ContactCtrl( ) {

  /*var queryParams = $location.search();

  $scope.contactModel = {
    'name': currentUser.first_name ? currentUser.first_name + ' ' + currentUser.last_name : '',
    'email': currentUser.email || '',
    'subject': '',
    'message': ''
  };

  //if there are query params, clear them
  if(queryParams) {
    $location.url($location.path());
  }

  //submit our form
  $scope.contactSubmit = function() {
    var contactData = {
          'name': $scope.contactModel.name,
          'email': $scope.contactModel.email,
          'subject': $scope.contactModel.subject,
          'message': $scope.contactModel.message
        };

    //user is logged in, add additional user data to our message
    if(currentUser.id) {
      contactData.message += '\n\nUserId: ' + currentUser.id;
    }

    //there are additional parameters (coming from the app)
    if(queryParams) {
      contactData.message += '\n\nQuery parameters: ' + JSON.stringify(queryParams);
    }

    //check if everything is valid
    if($scope.contactForm.$valid) {
      //disable form while request fires
      $scope.contactForm.$setValidity('loading', false);

      console.log(contactData);
      $timeout(function(){
        onSuccess();
      }, 5000);
      
      //ApiUtil.contact(contactData).then(onSuccess, onError);
    }
  };

  function onSuccess(resp) {
    //make form valid again
    $scope.contactForm.$setValidity('loading', true);

    //if successfully joined show message
    $scope.alertMessage = 'Thanks for contacting us! You\'ll hear from us shortly';
    $scope.alertType = 'success';
  }

  function onError(resp) {
    //make form valid again (until errors show)
    $scope.contactForm.$setValidity('loading', true);

    HandleErrors.onError(resp.data, $scope.contactForm);
  }*/
});
