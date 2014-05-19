angular.module( 'Morsel.common.imageUpload', [] )

//interface for uploading an image
.directive('mrslImageUpload', function($timeout){
  return {
    restrict: 'A',
    scope: {
      imageToUpload: '=mrslImageToUpload',
      remoteImageUrl: '=mrslImageRemoteUrl'
    },
    replace: true,
    link: function(scope, element, attrs) {
      //abort upload
      scope.abort = function() {
        scope.upload.abort(); 
        scope.upload = null;
      };

      //set our preview
      function setPreview(fileReader) {
        fileReader.onload = function(e) {
          $timeout(function() {
            scope.imageDataUrl = e.target.result;
          });
        };
      }

      //user chooses a file
      scope.onFileSelect = function($files) {
        //we only allow one file - pull the first
        scope.imageToUpload = $files[0];
        if (scope.upload) {
          scope.upload.abort();
        }
        scope.upload = null;
        scope.uploadResult = null;
        scope.imageDataUrl = '';

        //if Filereader API is available, use it to preview
        if (window.FileReader && scope.imageToUpload.type.indexOf('image') > -1) {
          var fileReader = new FileReader();
          fileReader.readAsDataURL(scope.imageToUpload);
          
          setPreview(fileReader);
        }
      };
    },
    templateUrl: 'common/images/upload.tpl.html'
  };
});