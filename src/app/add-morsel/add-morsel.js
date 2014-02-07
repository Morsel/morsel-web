angular.module( 'Morsel.addMorsel', [
  'angularFileUpload'])

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
    },
    resolve: {
      loggedInUser : 'userData'
    }
  });
})

.controller( 'AddMorselCtrl', function AddMorselCtrl( $scope, $stateParams, $upload, $timeout, Auth, APIURL ) {
  $scope.fileReaderSupported = window.FileReader != null;
  $scope.uploadRightAway = true;

  var savedUserId = Auth._getSavedUserId(),
        storedUserAuthToken = Auth._getSavedUserAuthToken(),
        url = APIURL+'/morsels.json?device=web&';
        //url = 'http://chriszamierowski.com/morsels.json?device=web&';

  if(savedUserId && storedUserAuthToken) {
    url+='api_key=' +savedUserId + ':' + storedUserAuthToken;
  }

  $scope.changeAngularVersion = function() {
    window.location.hash = $scope.angularVersion;
    window.location.reload(true);
  };
  $scope.hasUploader = function(index) {
    return $scope.upload[index] != null;
  };
  $scope.abort = function(index) {
    $scope.upload[index].abort(); 
    $scope.upload[index] = null;
  };
  $scope.angularVersion = window.location.hash.length > 1 ? window.location.hash.substring(1) : '1.2.0';

  function setPreview(fileReader, index) {
      fileReader.onload = function(e) {
          $timeout(function() {
            $scope.dataUrls[index] = e.target.result;
          });
      };
  }
  $scope.onFileSelect = function($files) {
    $scope.selectedFiles = [];
    $scope.progress = [];
    if ($scope.upload && $scope.upload.length > 0) {
      for (var i = 0; i < $scope.upload.length; i++) {
        if ($scope.upload[i] != null) {
          $scope.upload[i].abort();
        }
      }
    }
    $scope.upload = [];
    $scope.uploadResult = [];
    $scope.selectedFiles = $files;
    $scope.dataUrls = [];
    for ( var j = 0; j < $files.length; j++) {
      var $file = $files[j];
      if (window.FileReader && $file.type.indexOf('image') > -1) {
          var fileReader = new FileReader();
            fileReader.readAsDataURL($files[j]);
            
            setPreview(fileReader, j);
      }
      $scope.progress[j] = -1;
      if ($scope.uploadRightAway) {
        $scope.start(j);
      }
    }
  };

  $scope.start = function(index) {
    $scope.progress[index] = 0;

    $scope.upload[index] = $upload.upload({
      url : url,
      method: 'POST',
      //headers: {'myHeaderKey': 'myHeaderVal'},
      data : {
        'morsel[description]': $scope.morsel.description
      },
      /* formDataAppender: function(fd, key, val) {
        if (angular.isArray(val)) {
                      angular.forEach(val, function(v) {
                        fd.append(key, v);
                      });
                    } else {
                      fd.append(key, val);
                    }
      }, */
      file: $scope.selectedFiles[index],
      fileFormDataName: 'morsel[photo]'
    })
    .success(s)
    .error(e)
    .progress(function(evt) {
      console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total,10));
      $scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total,10);
    });
  };

  s = function(evt) {
    console.log('success');
    $scope.uploadResult.push(evt.data);
  };
  e = function(evt) {
    console.log('error');
  };
});
