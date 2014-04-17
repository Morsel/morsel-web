angular.module( 'Morsel.addMorsel', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'add-morsel', {
    url: '/add-morsel',
    views: {
      "main": {
        controller: 'AddMorselCtrl',
        templateUrl: 'add-morsel/add-morsel.tpl.html'
      }
    },
    data:{ pageTitle: 'Add Morsel' },
    access: {
      restricted : true
    }
  });
})

.controller( 'AddMorselCtrl', function AddMorselCtrl( $scope, ApiMorsels, $location, $timeout) {
  
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

  $scope.submit = function() {
    var uploadData = {
          morsel: {
            'description': $scope.description,
            'photo': this.selectedFile || null
          }
        };

    //call our join to take care of the heavy lifting
    //ApiMorsels.addMorsel(uploadData).then(onSuccess, onError);
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
