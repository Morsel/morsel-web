angular.module( 'Morsel.join', [
  'Morsel.match'
])

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

.controller( 'JoinCtrl', function JoinCtrl( $scope, Auth, $location, $timeout, $parse ) {

  //any errors to be displayed from server
  $scope.serverErrors = [];

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

  $scope.join = function() {
    var uploadData = {
          user: {
            'email': $scope.email,
            'username': $scope.username,
            'password': $scope.password,
            'first_name': $scope.first_name,
            'last_name': $scope.last_name,
            'title': $scope.title,
            'bio': $scope.bio,
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
    //if successfully joined, send to their feed
    $location.path('/myfeed');
  }

  function onError(resp) {
    var fieldName,
        fnEnglish,
        serverErrors,
        i;

    if(resp.data.errors) {
      //go through each type of error
      for (fieldName in resp.data.errors) {
        //we need an english phrase for the field name
        fnEnglish = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/ /g,"_");
        //get the errors for this field
        serverErrors = resp.data.errors[fieldName];

        //make good english
        for(i=0; i<serverErrors.length; i++) {
          serverErrors[i] = fnEnglish+' '+serverErrors[i];
        }

        //make sure there's a field associated with it
        if($scope.joinForm[fieldName]) {
          //set field as invalid
          $scope.joinForm[fieldName].$setValidity('server', false, $scope.joinForm);
          //put errors in model
          $scope.joinForm[fieldName].$error.serverErrors = serverErrors;
        }
      }
    }
  }

  //to be called onchange so we don't prevent form submit for server errors
  $scope.removeServerError = function(fieldName) {
    $scope.joinForm[fieldName].$setValidity('server', true, $scope.joinForm);
  };
});