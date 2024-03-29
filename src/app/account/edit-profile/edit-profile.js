angular.module( 'Morsel.account.editProfile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'account.edit-profile', {
    url: '/edit-profile',
    parent: 'account',
    views: {
      "account-body": {
        controller: 'EditProfileCtrl',
        templateUrl: 'app/account/edit-profile/edit-profile.tpl.html'
      }
    },
    data:{
      pageTitle: 'Edit Profile'
    },
    access: {
      restricted : true
    }
  });
})

.controller( 'EditProfileCtrl', function EditProfileCtrl( $scope, ApiUsers, HandleErrors, accountUser, Auth, USER_UPDATE_CHECK_TIME, $timeout){
  //basic info

  //model to store our profile data
  $scope.basicInfoModel = _.clone(accountUser);
  $scope.profilePhoto = null;

  //bio length validation
  $scope.bioLengthVer = {
    'length': {
      'max': '160',
      'message': 'Must be 160 characters or less'
    }
  };

  //submit our form
  $scope.updateBasicInfo = function() {
    var userData = {
      user: {
        'first_name': $scope.basicInfoModel.first_name,
        'last_name': $scope.basicInfoModel.last_name,
        'bio': $scope.basicInfoModel.bio
      }
    };

    if($scope.profilePhoto) {
      userData.user.photo = $scope.profilePhoto;
    }

    //check if everything is valid
    if($scope.basicInfoForm.$valid) {
      //disable form while request fires
      $scope.basicInfoForm.$setValidity('loading', false);

      //call our updateUser method to take care of the heavy lifting
      ApiUsers.updateUser($scope.basicInfoModel.id, userData).then(onBasicInfoSuccess, onBasicInfoError);
    }
  };

  function onBasicInfoSuccess(resp) {
    var userData = resp.data ? resp.data : resp;
    
    //make form valid again
    $scope.basicInfoForm.$setValidity('loading', true);

    if(userData.photo_processing) {
      //don't update the photos on the page yet
      userData.photos = null;

      $timeout(function() {
        Auth.updateUser().then(onBasicInfoSuccess);
      }, USER_UPDATE_CHECK_TIME);
    }

    //update our scoped current user
    Auth.updateUserWithData(userData);

    $scope.alertMessage = 'Successfully updated your basic info';
    $scope.alertType = 'success';
  }

  function onBasicInfoError(resp) {
    //make form valid again (until errors show)
    $scope.basicInfoForm.$setValidity('loading', true);
    
    //remove whatever message is there
    $scope.alertMessage = null;

    HandleErrors.onError(resp.data, $scope.basicInfoForm);
  }
});
