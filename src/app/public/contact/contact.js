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

.controller( 'ContactCtrl', function ContactCtrl( $scope, ApiUtil, HandleErrors, currentUser, $location ) {

  var queryParams = $location.search();

  $scope.contactModel = {
    'name': currentUser.first_name ? currentUser.first_name + ' ' + currentUser.last_name : '',
    'email': currentUser.email || '',
    'subject': '',
    'description': ''
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
          'description': $scope.contactModel.description
        };

    //user is logged in, add additional user data to our message
    if(currentUser.id) {
      contactData.description += '\n\nUserId: ' + currentUser.id;
    }

    //there are additional parameters (coming from the app)
    if(queryParams) {
      contactData.description += '\n\nQuery parameters: ' + JSON.stringify(queryParams);
    }

    //check if everything is valid
    if($scope.contactForm.$valid) {
      //disable form while request fires
      $scope.contactForm.$setValidity('loading', false);

      ApiUtil.contact(contactData).then(onSuccess, onError);
    }
  };

  function onSuccess(resp) {
    //hide form
    $scope.formSubmitted = true;

    //if successfully joined show message
    $scope.alertMessage = 'Thanks for contacting us! You\'ll hear from us shortly';
    $scope.alertType = 'success';
  }

  function onError(resp) {
    //make form valid again (until errors show)
    $scope.contactForm.$setValidity('loading', true);

    HandleErrors.onError(resp.data, $scope.contactForm);
  }
});
