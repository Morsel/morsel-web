angular.module( 'Morsel.login.join', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'auth.join', {
    url: '/join?next',
    parent: 'auth',
    views: {
      "auth-view": {
        controller: 'JoinCtrl',
        templateUrl: 'app/login/join/join.tpl.html'
      }
    },
    data: {
      pageTitle: 'Join Morsel'
    },
    resolve: {
      //make sure we resolve a user before displaying
      joinUser:  function(Auth, $window, $q){
        var deferred = $q.defer();

        Auth.getCurrentUserPromise().then(function(userData){
          //don't let a logged in user to this page
          if(Auth.isLoggedIn()) {
            $window.location.href = '/feed';
          } else {
            deferred.resolve(userData);
          }
        });

        return deferred.promise;
      }
    }
  })
  .state( 'auth.join.landing', {
    url: '/1',
    data: {
      pageTitle: 'Join Morsel'
    },
    views: {
      "landing": {
        controller: 'LandingCtrl',
        templateUrl: 'app/login/join/landing.tpl.html'
      }
    }
  })
  .state( 'auth.join.basicInfo', {
    url: '/2',
    views: {
      "basicInfo": {
        controller: 'BasicInfoCtrl',
        templateUrl: 'app/login/join/basicInfo.tpl.html'
      }
    }
  })
  .state( 'auth.join.additionalInfo', {
    url: '/3',
    views: {
      "additionalInfo": {
        controller: 'AdditionalInfoCtrl',
        templateUrl: 'app/login/join/additionalInfo.tpl.html'
      }
    }
  });
})

.controller( 'JoinCtrl', function JoinCtrl( $scope, $state, AfterLogin, $window, $stateParams ) {
  //if they're not trying to go to the second step
  if($state.current.name != 'auth.join.basicInfo') {
    //send them to the landing page
    $state.go('auth.join.landing', null, {location:'replace'});
  }

  $scope.finishedSignup = function() {
    //if successfully joined check if we have anything in the to-do queue
    if(AfterLogin.hasCallback()) {
      AfterLogin.goToCallbackPath();
    } else {
      //if they were on their way to a certain page
      if($stateParams.next) {
        $window.location.href = $stateParams.next;
      } else {
        //send them to the feed
        $window.location.href = '/feed';
      }
    }
  };
})

.controller( 'LandingCtrl', function LandingCtrl( $scope, $state, Mixpanel ) {
  $scope.joinEmail = function() {
    Mixpanel.track('Signup - Completed Step', {
      login_type: 'email',
      signup_step: 'initial'
    }, function() {
      $state.go('auth.join.basicInfo');
    });
  };
})

.controller( 'BasicInfoCtrl', function BasicInfoCtrl( $scope, Auth, HandleErrors, $state, AfterLogin, ApiUsers, localStorageService, Mixpanel, $q, $timeout ) {
  //used to differentiate between login types for UI
  $scope.usingEmail = _.isEmpty($scope.userData.social); 

  //model to store our basic info data
  $scope.basicInfoModel = {
    'first_name': $scope.userData.social.first_name || '',
    'last_name': $scope.userData.social.last_name || '',
    'email': $scope.userData.social.email || ''
  };

  //to store the picture a user might upload
  $scope.profilePhoto = null;

  if($scope.userData.social.pictureUrl) {
    setRemotePhotoUrl($scope.userData.social.pictureUrl);
  }

  //custom validation configs for password verification
  $scope.customMatchVer = {
    'match': {
      'matches': 'password',
      'message': 'Passwords don\'t match'
    }
  };

  //submit our form
  $scope.basicInfoSubmit = function() {
    var uploadData = {
          user: {
            'email': $scope.basicInfoModel.email,
            'username': $scope.basicInfoModel.username,
            'password': $scope.basicInfoModel.password,
            'first_name': $scope.basicInfoModel.first_name,
            'last_name': $scope.basicInfoModel.last_name,
            'professional': $scope.basicInfoModel.professional
          }
        },
        socialData,
        gaCookie = localStorageService.cookie.get('_ga', true);

    if($scope.profilePhoto) {
      uploadData.user.photo = $scope.profilePhoto;
    }

    if($scope.remotePhotoUrl) {
      uploadData.user.remote_photo_url = $scope.remotePhotoUrl;
    }

    if(gaCookie) {
      //send _ga value as __utmz until API is updated
      uploadData.__utmz = gaCookie;
    }

    if(!$scope.usingEmail) {
      socialData = {
        authentication: {
          'provider': $scope.userData.social.type,
          'token': $scope.userData.social.token,
          //tokens coming from the JS SDK are short-lived
          'short_lived': $scope.userData.social.short_lived || false,
          'uid': $scope.userData.social.id
        }
      };

      if($scope.userData.social.secret) {
        socialData.authentication.secret = $scope.userData.social.secret;
      }

      //combine our data to be passed along
      _.extend(uploadData, socialData);
    }

    //check if everything is valid
    if($scope.basicInfoForm.$valid) {
      //disable form while request fires
      $scope.basicInfoForm.$setValidity('loading', false);
      //call our join to take care of the heavy lifting
      Auth.join(uploadData).then(onSuccess, onError);
    }
  };

  function onSuccess(resp) {
    var login_type = ($scope.userData && $scope.userData.social && $scope.userData.social.type) ? $scope.userData.social.type : 'email',
        signupDeferredA = $q.defer(),
        signupDeferredB = $q.defer(),
        signupDeferredC = $q.defer(),
        mixpanelPromises = [signupDeferredA.promise, signupDeferredB.promise, signupDeferredC.promise],
        mixpanelTimeout;

    //store our user data for the next step if we need it
    $scope.userData.registered = resp;

    //associate user with mixpanel person
    Mixpanel.alias(resp.id);

    $q.all(mixpanelPromises).then(function(){
      //cancel the timeout
      $timeout.cancel(mixpanelTimeout);
      //proceed signup
      leaveSignup(resp.professional);
    });

    //set a timeout in case mixpanel calls don't all resolve, don't want to block user signup because of mixpanel
    mixpanelTimeout = $timeout(function() {
      //proceed signup
      leaveSignup(resp.professional);
    }, 5000);

    //set up mixpanel people profile
    Mixpanel.people.set({
      $email: resp.email,
      $created: resp.created_at,
      $first_name: resp.first_name,
      $last_name: resp.last_name,
      $username: resp.username,
      is_staff: resp.staff,
      is_pro: resp.professional
    }, function() {
      signupDeferredA.resolve();
    });

    //send signup flow event
    Mixpanel.track('Signup - Completed Step', {
      login_type: login_type,
      signup_step: 'final'
    }, function() {
      signupDeferredB.resolve();
    });

    //send $signup event
    Mixpanel.track('$signup', null, function() {
      signupDeferredC.resolve();
    });
  }

  function onError(resp) {
    //make form valid again (until errors show)
    $scope.basicInfoForm.$setValidity('loading', true);

    HandleErrors.onError(resp.data, $scope.basicInfoForm);
  }

  function setRemotePhotoUrl(url) {
    $scope.remotePhotoUrl = url;
  }

  function leaveSignup(isPro) {
    //if successfully joined send to the next step
    if(isPro) {
      //pros need more info
      $state.go('auth.join.additionalInfo');
    } else {
      //they're done
      $scope.finishedSignup();
    }
  }
})

.controller( 'AdditionalInfoCtrl', function AdditionalInfoCtrl( $scope ) {
  //skip cuisines and specialties
  $scope.skipCS = function() {
    //they're done
    $scope.finishedSignup();
  };
});