angular.module( 'Morsel.public.join', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'join', {
    url: '/join',
    views: {
      'main': {
        controller: 'JoinCtrl',
        templateUrl: 'join/join.tpl.html'
      }
    },
    data:{ pageTitle: 'Join' }
  });
})

.controller( 'JoinCtrl', function JoinCtrl( $scope, Auth, $location, $timeout, $parse, HandleErrors, AfterLogin ) {

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
  $scope.joinModel = {};

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
            'industry': $scope.joinModel.industry,
            'photo': this.selectedFile || null
          }
        };

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
      //or else send to their feed
      $location.path('/myfeed');
    }
  }

  function onError(resp) {
    HandleErrors.onError(resp, $scope.joinForm);
  }
});