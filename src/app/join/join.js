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

.controller( 'JoinCtrl', function JoinCtrl( $scope, Auth, $location, $timeout ) {

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

    //call our join to take care of the heavy lifting
    Auth.join(uploadData, onSuccess, onError);
  };

  function onSuccess(resp) {
    //if successfully joined, send to their feed
    $location.path('/myfeed');
  }

  function onError(resp) {
    if(resp.data.errors) {
      //show our errors
      $scope.serverErrors = resp.data.errors;
    }
  }
});