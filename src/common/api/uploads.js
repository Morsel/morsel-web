angular.module( 'Morsel.apiUploads', [] )

// ApiUploads is the middleman for dealing with requests potentially involving uploading images
.factory('ApiUploads', function($http, Restangular, $q, $upload, APIURL, DEVICEKEY, DEVICEVALUE, VERSIONKEY, VERSIONVALUE) {
  var Uploads = {};

  Uploads.upload = function(uploadData, file, filename, apiPath, httpType, onProgress) {
    var deferred = $q.defer(),
        //currentUser = Auth.getCurrentUser(),
        deviceQS = DEVICEKEY+'='+DEVICEVALUE,
        versionQS = VERSIONKEY+'='+VERSIONVALUE;
        /*apiKeyQS = 'api_key='+currentUser.id+':'+currentUser.auth_token*/

    //need to get our userdata first
    userData.then(function(data) {
      console.log(data);
      //use angular upload and returned promise
      $upload.upload({
        url : APIURL + '/'+apiPath+'.json?'+deviceQS+'&'+versionQS,//+'&'+apiKeyQS,
        method: httpType,
        data: uploadData,
        file: file,
        fileFormDataName: filename
      })
      .success(function(data, status, headers, config) {
        //return this to match Restangular returning user data format
        deferred.resolve(data.data);
      })
      .error(function(data, status, headers, config){
        //return this to match Restangular return format
        deferred.reject({
          data: data,
          status: status,
          headers: headers,
          config: config
        });
      })
      .progress(onProgress);
    });

    return deferred.promise;
  };

  return Uploads;
});