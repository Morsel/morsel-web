angular.module( 'Morsel.login.join', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'join', {
    url: '/join?next',
    views: {
      "main": {
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
            $window.location.href = '/';
          } else {
            deferred.resolve(userData);
          }
        });

        return deferred.promise;
      }
    }
  })
  .state( 'join.landing', {
    url: '/1',
    views: {
      "landing": {
        controller: 'LandingCtrl',
        templateUrl: 'app/login/join/landing.tpl.html'
      }
    }
  })
  .state( 'join.basicInfo', {
    url: '/2',
    views: {
      "basicInfo": {
        controller: 'BasicInfoCtrl',
        templateUrl: 'app/login/join/basicInfo.tpl.html'
      }
    }
  })
  .state( 'join.additionalInfo', {
    url: '/3',
    views: {
      "additionalInfo": {
        controller: 'AdditionalInfoCtrl',
        templateUrl: 'app/login/join/additionalInfo.tpl.html'
      }
    }
  });
})

.controller( 'JoinCtrl', function JoinCtrl( $scope, $state, joinUser ) {
  //if they're not trying to go to the second step
  if($state.current.name != 'join.basicInfo') {
    //send them to the landing page
    $state.go('join.landing');
  }
})

.controller( 'LandingCtrl', function LandingCtrl( $scope, $state ) {
  $scope.joinEmail = function() {
    $state.go('join.basicInfo');
  };
})

.controller( 'BasicInfoCtrl', function BasicInfoCtrl( $scope, Auth, HandleErrors, $state, AfterLogin, ApiUsers ) {
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

  if($scope.userData.social.picture) {
    setRemotePhotoUrl($scope.userData.social.picture.data.url);
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
            'last_name': $scope.basicInfoModel.last_name
          }
        },
        socialData;

    if($scope.profilePhoto) {
      uploadData.user.photo = $scope.profilePhoto;
    }

    if($scope.remotePhotoUrl) {
      uploadData.user.remote_photo_url = $scope.remotePhotoUrl;
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
    //make form valid again
    $scope.basicInfoForm.$setValidity('loading', true);

    //store our user data for the next step if we need it
    $scope.userData.registered = resp;

    //if successfully joined send to the next step
    $state.go('join.additionalInfo');
  }

  function onError(resp) {
    //make form valid again (until errors show)
    $scope.basicInfoForm.$setValidity('loading', true);

    HandleErrors.onError(resp.data, $scope.basicInfoForm);
  }

  function setRemotePhotoUrl(url) {
    $scope.remotePhotoUrl = url;
  }
})

.controller( 'AdditionalInfoCtrl', function AdditionalInfoCtrl( $scope, ApiUsers, $q, AfterLogin, HandleErrors, $window, $stateParams) {
  //a cleaner way of building radio buttons
  $scope.industryValues = [{
    'name':'Chef',
    'value':'chef'
  },
  {
    'name':'Media',
    'value':'media'
  },
  {
    'name':'Diner',
    'value':'diner'
  }];

  //model to store our additional data
  $scope.additionalInfoModel = {};

  //submit our form
  $scope.submitAdditionalInfo = function() {
    var industryPromise,
        userInfoPromise;

    //check if everything is valid
    if($scope.additionalInfoForm.$valid) {
      //disable form while request fires
      $scope.additionalInfoForm.$setValidity('loading', false);

      industryPromise = ApiUsers.updateIndustry($scope.userData.registered.id, $scope.additionalInfoModel.industry);
      userInfoPromise = ApiUsers.updateUser($scope.userData.registered.id, {
        user: {
          bio: $scope.additionalInfoModel.bio
        }
      });

      //once all promises are resolved, send them on their way
      $q.all([industryPromise, userInfoPromise]).then(onSuccess, onError);
    }
  };

  function onSuccess(resp) {
    //make form valid again
    $scope.additionalInfoForm.$setValidity('loading', true);

    //if successfully joined check if we have anything in the to-do queue
    if(AfterLogin.hasCallback()) {
      AfterLogin.goToCallbackPath();
    } else {
      //if they were on their way to a certain page
      if($stateParams.next) {
        $window.location.href = $stateParams.next;
      } else {
        //send them home
        $window.location.href = '/';
      }
    }
  }

  function onError(resp) {
    //make form valid again (until errors show)
    $scope.additionalInfoForm.$setValidity('loading', true);
    
    HandleErrors.onError(resp.data, $scope.additionalInfoForm);
  }
});