angular.module( 'Morsel.login.join', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'join', {
    url: '/join',
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

.controller( 'BasicInfoCtrl', function BasicInfoCtrl( $scope, Auth, $timeout, HandleErrors, $state, AfterLogin, ApiUsers, $modal, $rootScope ) {
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
      //call our join to take care of the heavy lifting
      Auth.join(uploadData).then(onSuccess, onError);
    }
  };

  function onSuccess(resp) {
    //store our user data for the next step if we need it
    $scope.userData.registered = resp;

    //if successfully joined send to the next step
    $state.go('join.additionalInfo');
  }

  function onError(resp) {
    //if user tried to authenticate with twitter and failed, check if it was because
    //their email might have already existed. split this into nested ifs for readability...
    //if there was an email error
    if(resp.data && resp.data.errors && resp.data.errors.email) {
      //if there was only one email error and it was that the email was already taken
      if((resp.data.errors.email.length === 1) && (resp.data.errors.email[0] === 'has already been taken')) {
        //user entered an email that already exists. prompt them to merge accounts

        showExistingAccountModal();
      }
    }

    HandleErrors.onError(resp.data, $scope.basicInfoForm);
  }

  function setRemotePhotoUrl(url) {
    $scope.remotePhotoUrl = url;
  }

  function showExistingAccountModal() {
    var ModalInstanceCtrl = function ($scope, $modalInstance, $location, $window, HandleErrors, scopeWithData) {
      $scope.email = scopeWithData.basicInfoModel.email;
      $scope.socialType = 'Twitter';

      $scope.cancel = function () {
        scopeWithData.userData.social.email = '';
        $modalInstance.dismiss('cancel');
      };

      $scope.combineAccounts = function() {
        AfterLogin.addCallbacks(function() {
          ApiUsers.createUserAuthentication({
            'authentication': {
              'provider': 'twitter',
              'token': scopeWithData.userData.social.token,
              'secret': scopeWithData.userData.social.secret,
              //tokens coming from twitter are long-lived
              'short_lived': false,
              'uid': scopeWithData.userData.social.id
            }
          }).then(function() {
            //send them home (trigger page refresh to switch apps)
            $window.location.href = '/';
          }, function(resp) {
            HandleErrors.onError(resp.data, scopeWithData.basicInfoForm);
          });
        });

        $location.path('/login');
      };

      $rootScope.$on('$locationChangeSuccess', function () {
        $modalInstance.dismiss('cancel');
      });
    };
    //we need to implicitly inject dependencies here, otherwise minification will botch them
    ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', '$location', '$window', 'HandleErrors', 'scopeWithData'];

    var modalInstance = $modal.open({
      templateUrl: 'common/user/duplicateEmailOverlay.tpl.html',
      controller: ModalInstanceCtrl,
      resolve: {
        //pass the outside scope
        scopeWithData: function () {
          return $scope;
        }
      }
    });
  }
})

.controller( 'AdditionalInfoCtrl', function AdditionalInfoCtrl( $scope, ApiUsers, $q, AfterLogin, HandleErrors, $window) {
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
      industryPromise = ApiUsers.updateIndustry($scope.userData.registered.id, $scope.additionalInfoModel.industry);
      userInfoPromise = ApiUsers.updateUser($scope.userData.registered.id, {
        bio: $scope.additionalInfoModel.bio
      });

      //once all promises are resolved, send them on their way
      $q.all([industryPromise, userInfoPromise]).then(onSuccess, onError);
    }
  };

  function onSuccess(resp) {
    //if successfully joined check if we have anything in the to-do queue
    if(AfterLogin.hasCallbacks()) {
      AfterLogin.executeCallbacks();
    } else {
      //send them home (trigger page refresh to switch apps)
      $window.location.href = '/';
    }
  }

  function onError(resp) {
    HandleErrors.onError(resp.data, $scope.additionalInfoForm);
  }
});