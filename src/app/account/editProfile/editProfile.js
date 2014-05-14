angular.module( 'Morsel.account.editProfile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'account.edit-profile', {
    url: '/edit-profile',
    views: {
      "main": {
        controller: 'EditProfileCtrl',
        templateUrl: 'app/account/editProfile/editProfile.tpl.html'
      }
    },
    data:{
      pageTitle: 'Edit Profile'
    },
    access: {
      restricted : true
    },
    resolve: {}
  });
})

.controller( 'EditProfileCtrl', function EditProfileCtrl( $scope, $stateParams, ApiUsers, ApiKeywords, HandleErrors, $window, accountUser){
  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.hideFooter = true;

  $scope.basicInfoModel = accountUser;

  ApiKeywords.getAllCuisines().then(function(cuisineData) {
    var allCuisines = [];

    _.each(cuisineData, function(c) {
      allCuisines.push({
        value: c.value,
        name: c.name
      }); 
    });

    $scope.allCuisines = allCuisines;
  });

  ApiUsers.getCuisines(accountUser.id).then(function(cuisineData) {
    $scope.userCuisines = cuisineData;
  });

  //model to store our profile data
  $scope.basicInfoModel = {};

  //submit our form
  $scope.updateBasicInfo = function() {
    var userData = {
      user: {
        'first_name': $scope.basicInfoModel.first_name,
        'last_name': $scope.basicInfoModel.last_name,
        'email': $scope.basicInfoModel.email,
        'bio': $scope.basicInfoModel.bio
      }
    };

    //check if everything is valid
    if($scope.basicInfoForm.$valid) {
      //call our updateUser method to take care of the heavy lifting
      ApiUsers.updateUser($scope.basicInfoModel.id, userData).then(onBasicInfoSuccess, onBasicInfoError);
    }
  };

  function onBasicInfoSuccess(resp) {
    $scope.alertMessage = 'Successfully updated your basic info';
    $scope.alertType = 'success';
  }

  function onBasicInfoError(resp) {
    HandleErrors.onError(resp, $scope.basicInfoForm);
  }
});
