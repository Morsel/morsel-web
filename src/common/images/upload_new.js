angular.module( 'Morsel.common.imageUploadNew', [] )

//interface for uploading an image
.directive('mrslImageUploadNew', function($timeout, $interval, $http, $upload, ApiItems, xml2json){
  return {
    restrict: 'A',
    scope: {
      item: '=mrslImageUploadNew'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var s3progressMax = 50.0, //percent
          maxFileSize = 6000000; //6MB

      scope.usingFlash = FileAPI && FileAPI.upload != null;
      scope.hasFlashInstalled = FileAPI && FileAPI.hasFlash;
      scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 !== false);
      scope.uploadRightAway = true;

      scope.hasUploader = function(index) {
        return scope.upload[index] != null;
      };

      scope.onFileSelect = function($files) {
        var i,
            j;

        scope.selectedFiles = [];
        scope.progress = [];
        scope.displayProgress = -1;
        if (scope.upload && scope.upload.length > 0) {
          for (i = 0; i < scope.upload.length; i++) {
            if (scope.upload[i] != null) {
              scope.upload[i].abort();
            }
          }
        }
        scope.upload = [];
        scope.uploadResult = [];
        scope.selectedFiles = $files;
        scope.dataUrls = [];
        for (j = 0; j < $files.length; j++) {
          var $file = $files[j];

          //check for a max file size
          if($file.size >= maxFileSize) {
            $file = null;
            scope.selectedFiles = [];
            scope.errorMsg = 'Please use an image less than 6MB';
            return;
          }

          if (scope.fileReaderSupported && $file.type.indexOf('image') > -1) {
            var fileReader = new FileReader();

            fileReader.readAsDataURL($files[j]);
            loadFile(fileReader, j);
          }
          scope.progress[j] = -1;
          if (scope.uploadRightAway) {
            scope.uploadToS3(j);
          }
        }
      };

      function loadFile(fileReader, index) {
        fileReader.onload = function(e) {
          $timeout(function() {
            scope.dataUrls[index] = e.target.result;
          });
        };
      }
      
      scope.uploadToS3 = function(index) {
        //keep a local copy of this to pass to amazon. will need to have already loaded from API
        var uploadData = _.clone(scope.item.presigned_upload);

        //keep track of whether an upload is currently occuring
        scope.item.uploading = true;

        //amazon will complain
        delete uploadData.url;

        scope.progress[index] = 0;
        scope.errorMsg = null;

        scope.upload[index] = $upload.upload({
          url: scope.item.presigned_upload.url,
          method: 'POST',
          data : uploadData,
          file: scope.selectedFiles[index]
        });
        scope.upload[index].then(function(resp) {
          $timeout(function() {
            updateAPI(resp);
          });
        }, function(response) {
          if (response.status > 0) {
            scope.errorMsg = 'There was a problem uploading your image. Please try again.';
          }
        }, function(evt) {
          // Math.min is to fix IE which reports 200% sometimes
          scope.progress[index] = Math.min(s3progressMax, parseInt(s3progressMax * evt.loaded / evt.total, 10));
          scope.displayProgress = scope.progress[index];
        });
      };
      
      scope.dragOverClass = function($event) {
        var items = $event.dataTransfer.items;
        var hasFile = false;
        if (items != null) {
          for (var i = 0 ; i < items.length; i++) {
            if (items[i].kind == 'file') {
              hasFile = true;
              break;
            }
          }
        } else {
          hasFile = true;
        }
        return hasFile ? "dragover" : "dragover-err";
      };

      function updateAPI(resp) {
        var data = xml2json.parser(resp.data),
            parsedData;

        parsedData = {
            location: data.postresponse.location,
            bucket: data.postresponse.bucket,
            key: data.postresponse.key,
            etag: data.postresponse.etag
        };
        
        ApiItems.updateItem(scope.item.id, {
          item: {
            photo_key: parsedData.key
          }
        }).then(function(resp){
          increaseProgressTo(70, 400, checkPhotosProcessed);
        }, function() {
          scope.errorMsg = 'There was a problem uploading your image. Please try again.';
        });
      }

      function increaseProgressTo(increaseTo, increaseTime, onComplete) {
        var progressInterval = $interval(function(){
          if(increaseTo <= scope.displayProgress) {
            $interval.cancel(progressInterval);
            onComplete();
          }
          scope.displayProgress++;
        }, increaseTime);
      }

      function checkPhotosProcessed() {
        //keep checking photos until they're done
        $timeout(function(){
          ApiItems.getItem(scope.item.id).then(function(resp){
            if(resp.data.photo_processing) {
              checkPhotosProcessed();
            } else {
              //complete the progress bar
              increaseProgressTo(100, 10, function(){
                //replace the scoped item's photos so the thumbnail updates
                scope.item.photos = resp.data.photos;
                if(scope.item.uploading) {
                  scope.item.uploading = false;
                }
              });
            }
          });
        }, 3000);
      }
    },
    templateUrl: 'common/images/uploadNew.tpl.html'
  };
});