angular.module( 'Morsel.account.join', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'join', {
    url: '/account/join',
    views: {
      "main": {
        controller: 'JoinCtrl',
        templateUrl: 'app/account/join/join.tpl.html'
      }
    },
    data:{
      pageTitle: 'Join Morsel'
    }
  })
  .state( 'join.landing', {
    views: {
      "landing": {
        controller: 'LandingCtrl',
        templateUrl: 'app/account/join/landing.tpl.html'
      }
    }
  })
  .state( 'join.basicInfo', {
    views: {
      "basicInfo": {
        controller: 'BasicInfoCtrl',
        templateUrl: 'app/account/join/basicInfo.tpl.html'
      }
    }
  })
  .state( 'join.additionalInfo', {
    views: {
      "additionalInfo": {
        controller: 'AdditionalInfoCtrl',
        templateUrl: 'app/account/join/additionalInfo.tpl.html'
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

.controller( 'LandingCtrl', function LandingCtrl( $scope, ApiUsers, $state, $q, HandleErrors, $modal, $rootScope ) {
  var fb;

  //our authentication code

  //facebook
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '1402286360015732',
      cookie     : true,  // enable cookies to allow the server to access 
                          // the session
      xfbml      : true,  // parse social plugins on this page
      version    : 'v2.0' // use version 2.0
    });
  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  $scope.signupFacebook = function() {
    FB.login(function(response) {
      var fbUserPromise,
          fbPicturePromise;

      if (response.status === 'connected') {
        // user is logged into your app and Facebook.
        if(response.authResponse && response.authResponse.userID) {
          ApiUsers.checkAuthentication('facebook', response.authResponse.userID).then(function(resp){
            //if we already have them on file
            if(resp && resp.data) {
              //just sign them in
              console.log(resp);
              alert('signing in...');
              //come back to this!
            } else {
              //otherwise get some basic info from fb
              fbUserPromise = fb.getUserInfo();
              //and get user's picture
              fbPicturePromise = fb.getUserPicture();

              //once all promises are resolved with data from fb, send to main form
              $q.all([fbUserPromise, fbPicturePromise]).then(function(){
                //where we pulled the data
                $scope.userData.social.type = 'facebook';
                //social token
                $scope.userData.social.token = response.authResponse.accessToken;

                //send to main form
                $state.go('join.basicInfo');
              });
            }
          }, function(resp) {
            //something went wrong...
          });
        }
      }
    }, {
      scope: 'public_profile,email,user_friends'
    });
  };

  $scope.joinEmail = function() {
    $state.go('join.basicInfo');
  };

  fb = {
    getUserInfo: function() {
      var deferred = $q.defer();

      FB.api('/me', function(myInfo) {
        //store our basic user info so we can prepopulate form
        $scope.userData.social = myInfo;

        //check to see if this user's email is already in use on morsel
        ApiUsers.validateEmail(myInfo.email).then(function(resp){
          deferred.resolve();
        }, function(resp) {
          //if this email already exists...
          if(resp.data && resp.data.errors && resp.data.errors.email && (_.indexOf(resp.data.errors.email, 'has already been taken')>=0)) {
            //pop an overlay prompting user to associated fb data to existing morsel account
            fb.existingAccountModal($scope, deferred);
          } else {
            //deal with API error...
            //HandleErrors.onError(resp, FORM);
          }
        });
      });

      return deferred.promise;
    },
    getUserPicture: function() {
      var deferred = $q.defer();

      FB.api('/me/picture', {
        'width': '144',
        'height': '144'
      }, function(myPicture) {
        //store our picture info so we can prepopulate form
        $scope.userData.social.picture = myPicture;
        deferred.resolve();
      });

      return deferred.promise;
    },
    existingAccountModal: function(scopeWithData, deferred) {
      var ModalInstanceCtrl = function ($scope, $modalInstance, scopeWithData, deferred) {
        $scope.email = scopeWithData.userData.social.email;

        //if user cancels, allow fb info to go through, but strip out email
        $scope.cancel = function () {
          scopeWithData.userData.social.email = '';
          $modalInstance.dismiss('cancel');
          deferred.resolve();
        };

        $scope.combineAccounts = function() {
          alert('combine accounts');
          //send to login, then combine once you're there
          //COME BACK TO THIS
        };

        $rootScope.$on('$locationChangeSuccess', function () {
          $modalInstance.dismiss('cancel');
        });
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'scopeWithData', 'deferred'];

      var modalInstance = $modal.open({
        templateUrl: 'common/user/duplicateEmailOverlay.tpl.html',
        controller: ModalInstanceCtrl,
        resolve: {
          scopeWithData: function () {
            return scopeWithData;
          },
          deferred: function () {
            return deferred;
          }
        }
      });
    }
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
        $scope.dataUrl = e.target.result;
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
    $scope.dataUrl = '';

    //if Filereader API is available, use it to preview
    if (window.FileReader && $scope.selectedFile.type.indexOf('image') > -1) {
      var fileReader = new FileReader();
      fileReader.readAsDataURL($scope.selectedFile);
      
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
})

.controller( 'AdditionalInfoCtrl', function AdditionalInfoCtrl( $scope, ApiUsers, $q, AfterLogin, HandleErrors) {
  //a cleaner way of building radio buttons
  $scope.industryValues = [{
    'name':'Restaurant Staff',
    'value':'chef'
  },
  {
    'name':'Press / Media',
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
      alert('signup success!');
      //or else send to their feed
      //$location.path('/myfeed');
    }
  }

  function onError(resp) {
    HandleErrors.onError(resp, $scope.additionalInfoForm);
  }
});