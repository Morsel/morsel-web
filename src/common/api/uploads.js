angular.module( 'Morsel.common.apiUploads', [] )

// ApiUploads is the middleman for dealing with requests involving uploading images
.factory('ApiUploads', function($http, Restangular, $q) {
  var Uploads = {};

  //sends a restangular multi-part POST
  Uploads.postUpload = function(RestangularObj, formData) {
    var deferred = $q.defer();

    //POST our multi-part data with custom headers
    RestangularObj.withHttpConfig({
      transformRequest: angular.identity
    }).customPOST(
      formData,
      undefined,
      {},
      {'Content-type':undefined}
    ).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  //sends a restangular multi-part PUT
  Uploads.putUpload = function(RestangularObj, formData) {
    var deferred = $q.defer();

    //PUT our multi-part data with custom headers
    RestangularObj.withHttpConfig({
      transformRequest: angular.identity
    }).customPUT(
      formData,
      undefined,
      {},
      {'Content-type':undefined}
    ).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Uploads;
})

/* taken from https://github.com/danialfarid/angular-file-upload */

.directive('ngFileSelectOld', function($parse, $http, $timeout) {
  return function(scope, elem, attr) {
    var fn = $parse(attr['ngFileSelectOld']);
    elem.bind('change', function(evt) {
      var files = [], fileList, i;
      fileList = evt.target.files;
      if (fileList != null) {
        for (i = 0; i < fileList.length; i++) {
          files.push(fileList.item(i));
        }
      }
      $timeout(function() {
        fn(scope, {
          $files : files,
          $event : evt
        });
      });
    });
    elem.bind('click', function(){
      this.value = null;
    });
  };
})

.directive('ngFileDropAvailableOld', function($parse, $http, $timeout) {
  return function(scope, elem, attr) {
    if ('draggable' in document.createElement('span')) {
      var fn = $parse(attr['ngFileDropAvailableOld']);
      $timeout(function() {
        fn(scope);
      });
    }
  };
})

.directive('ngFileDropOld', function($parse, $http, $timeout) {
  return function(scope, elem, attr) {
    if ('draggable' in document.createElement('span')) {
      var fn = $parse(attr['ngFileDropOld']);
      elem[0].addEventListener("dragover", function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        elem.addClass(attr['ngFileDragOverClass'] || "dragover");
      }, false);
      elem[0].addEventListener("dragleave", function(evt) {
        elem.removeClass(attr['ngFileDragOverClass'] || "dragover");
      }, false);
      elem[0].addEventListener("drop", function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        elem.removeClass(attr['ngFileDragOverClass'] || "dragover");
        var files = [], fileList = evt.dataTransfer.files, i;
        if (fileList != null) {
          for (i = 0; i < fileList.length; i++) {
            files.push(fileList.item(i));
          }
        }
        $timeout(function() {
          fn(scope, {
            $files : files,
            $event : evt
          });
        });
      }, false);
    }
  };
});