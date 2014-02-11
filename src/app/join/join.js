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

.controller( 'JoinCtrl', function JoinCtrl( $scope, $stateParams, Auth, $upload, $location, $timeout, APIURL ) {

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
    $scope.progress = 0;
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
    $scope.progress = -1;
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
            'bio': $scope.bio || ''
          }
        },
        formattedData = {};

    //if there's an image to upload, use form-data
    if(this.selectedFile) {
      //need to reformat this data a bit for a multi-part POST
      for(var i in uploadData) {
        for(var j in uploadData[i]) {
          formattedData[i+'['+j+']'] = uploadData[i][j];
        }
      }

      this.progress = 0;

      //user angular upload with photo
      this.upload = $upload.upload({
        url : APIURL + '/users.json?device=web',
        method: 'POST',
        data: formattedData,
        file: this.selectedFile,
        fileFormDataName: 'user[photo]'
      })
      .success(onSuccess)
      .error(onError)
      .progress(onProgress);
    } else {
      //otherwise use a normal Restangular upload
      Auth.join(uploadData, function() {
        //if successfully joined, send to their feed
        $location.path('/myfeed');
      }, function(resp) {
        $scope.serverErrors = resp.data.errors;
      });
    }
  };

  function onSuccess(resp) {
    Auth.joined(resp.data);

    //if successfully joined, send to their feed
    $location.path('/myfeed');
  }

  function onError(resp) {
    Auth.clearCurrentUser();

    if(resp.errors) {
      //show our errors
      $scope.serverErrors = resp.errors;
    }
  }

  function onProgress(evt) {
    console.log('progress');
    $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total, 10));
  }
});