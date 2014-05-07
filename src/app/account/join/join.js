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
  });
})

.controller( 'JoinCtrl', function JoinCtrl( $scope, $state ) {
  //for storing data to pass between views
  $scope.socialData = {
    user: {}
  };

  //immediately send them
  $state.go('join.landing');
})

.controller( 'LandingCtrl', function LandingCtrl( $scope, ApiUsers, $state, $q ) {
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
                $scope.socialData.type = 'facebook';
                //social token
                $scope.socialData.token = response.authResponse.accessToken;
                
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
        $scope.socialData.user = myInfo;
        deferred.resolve();
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
        $scope.socialData.picture = myPicture;
        deferred.resolve();
      });

      return deferred.promise;
    }
  };
})

.controller( 'BasicInfoCtrl', function BasicInfoCtrl( $scope, Auth, $location, $timeout, $parse, HandleErrors, AfterLogin, $stateParams ) {
  //used to differentiate between login types for UI
  $scope.usingEmail = _.isEmpty($scope.socialData.user); 

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

  //model to store our join data
  $scope.joinModel = {
    'first_name': $scope.socialData.user.first_name || '',
    'last_name': $scope.socialData.user.last_name || '',
    'email': $scope.socialData.user.email || ''
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
  $scope.join = function() {
    var uploadData = {
          user: {
            'email': $scope.joinModel.email,
            'username': $scope.joinModel.username,
            'password': $scope.joinModel.password,
            'first_name': $scope.joinModel.first_name,
            'last_name': $scope.joinModel.last_name,
            'title': $scope.joinModel.title,
            'bio': $scope.joinModel.bio,
            'industry': $scope.joinModel.industry
          }
        },
        socialData;

    if(this.selectedFile) {
      uploadData.user.photo = this.selectedFile;
    }

    if(!$scope.usingEmail) {
      socialData = {
        authentication: {
          'provider': $scope.socialData.type,
          'token': $scope.socialData.token
        }
      };

      if($scope.socialData.secret) {
        socialData.authentication.secret = $scope.socialData.secret;
      }

      //combine our data to be passed along
      _.extend(uploadData, socialData);
    }

    //check if everything is valid
    if($scope.joinForm.$valid) {
      //call our join to take care of the heavy lifting
      Auth.join(uploadData, onSuccess, onError);
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
    HandleErrors.onError(resp, $scope.joinForm);
  }
});