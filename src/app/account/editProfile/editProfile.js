angular.module( 'Morsel.account.editProfile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'edit-profile', {
    url: '/account/edit-profile',
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
    resolve: {
      userCanEdit : function($stateParams, Auth) {
        return $stateParams.username === Auth.getCurrentUser()['username'];
      }
    }
  });
})

.controller( 'EditProfileCtrl', function EditProfileCtrl( $scope, $stateParams, ApiUsers, userCanEdit, ApiKeywords, HandleErrors, $window ) {
  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.hideFooter = true;

  ApiKeywords.getAllCuisines().then(function(cuisineData) {
    var allCuisines = {};

    _.each(cuisineData, function(c) {
      allCuisines.append({
        value: c.value,
        name: c.name
      }); 
    });

    $scope.allCuisines = allCuisines;
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

  ApiUsers.getMyData().then(function(userData) {
    $scope.basicInfoModel = userData;

    ApiUsers.getCuisines(userData.id).then(function(cuisineData) {
      $scope.userCuisines = cuisineData;
    });
  }, function() {
    //if there's an error retrieving user data, go to login
    $window.location.href = '/login';
  });
});
