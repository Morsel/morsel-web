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
    data:{
      pageTitle: 'Join Morsel'
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

.controller( 'JoinCtrl', function JoinCtrl( $scope, $state ) {
  //for storing data to pass between views
  $scope.userData = {
    social: {},
    registered: {}
  };

  //immediately send them
  $state.go('join.landing');
})

.controller( 'LandingCtrl', function LandingCtrl( $scope, $state ) {
  $scope.joinEmail = function() {
    $state.go('join.basicInfo');
  };
})

.controller( 'BasicInfoCtrl', function BasicInfoCtrl( $scope, Auth, $timeout, HandleErrors, $state ) {
  //used to differentiate between login types for UI
  $scope.usingEmail = _.isEmpty($scope.userData.social); 

  //model to store our basic info data
  $scope.basicInfoModel = {
    'first_name': $scope.userData.social.first_name || '',
    'last_name': $scope.userData.social.last_name || '',
    'email': $scope.userData.social.email || ''
  };

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

  //file upload stuff (should be moved eventually...)
  //abort upload
  $scope.abort = function() {
    $scope.upload.abort(); 
    $scope.upload = null;
  };

  //set our preview
  function setPreview(fileReader) {
    fileReader.onload = function(e) {
      $timeout(function() {
        $scope.photoDataUrl = e.target.result;
      });
    };
  }

  //user chooses a file
  $scope.onFileSelect = function($files) {
    //we only allow one file - pull the first
    $scope.selectedFile = $files[0];
    if ($scope.upload) {
      $scope.upload.abort();
    }
    $scope.upload = null;
    $scope.uploadResult = null;
    $scope.photoDataUrl = '';

    //if Filereader API is available, use it to preview
    if (window.FileReader && $scope.selectedFile.type.indexOf('image') > -1) {
      var fileReader = new FileReader();
      fileReader.readAsphotoDataUrl($scope.selectedFile);
      
      setPreview(fileReader);
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

    if(this.selectedFile) {
      uploadData.user.photo = this.selectedFile;
    }

    if($scope.remotePhotoUrl) {
      uploadData.user.remote_photo_url = $scope.remotePhotoUrl;
    }

    if(!$scope.usingEmail) {
      socialData = {
        authentication: {
          'provider': $scope.userData.social.type,
          'token': $scope.userData.social.token
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
      Auth.join(uploadData, onSuccess, onError);
    }
  };

  function onSuccess(resp) {
    //store our user data for the next step if we need it
    $scope.userData.registered = resp;

    //if successfully joined send to the next step
    $state.go('join.additionalInfo');
  }

  function onError(resp) {
    HandleErrors.onError(resp, $scope.basicInfoForm);
  }

  function setRemotePhotoUrl(url) {
    $scope.remotePhotoUrl = url;
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
    HandleErrors.onError(resp, $scope.additionalInfoForm);
  }
});