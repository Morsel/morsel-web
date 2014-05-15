angular.module( 'Morsel.public.editProfile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'edit-profile', {
    url: '/:username/edit',
    views: {
      "main": {
        controller: 'EditProfileCtrl',
        templateUrl: 'app/public/profile/edit-profile.tpl.html'
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

.controller( 'EditProfileCtrl', function ProfileCtrl( $scope, $stateParams, ApiUsers, userCanEdit, ApiKeywords ) {
  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.hideFooter = true;

  ApiKeywords.getAllCuisines().then(function(cuisineResp) {
    $scope.allCuisines = cuisineResp.data;
  });

  //model to store our profile data
  $scope.editProfileModel = {};

  //submit our form
  $scope.updateProfile = function() {
    var userData = {
      user: {
        'first_name': $scope.editProfileModel.first_name,
        'last_name': $scope.editProfileModel.last_name,
        'email': $scope.editProfileModel.email,
        'bio': $scope.editProfileModel.bio
      }
    };

    //check if everything is valid
    if($scope.editProfileForm.$valid) {
      //call our updateUser method to take care of the heavy lifting
      ApiUsers.updateUser($scope.editProfileModel.id, userData, onSuccess, onError);
    }
  };

  function onSuccess(resp) {
    //send them back to their profile
    $location.path('/'+resp.username);
  }

  function onError(resp) {
    HandleErrors.onError(resp, $scope.editProfileForm);
  }

  ApiUsers.getMyData().then(function(userResp) {
    $scope.editProfileModel = userResp.data;

    ApiUsers.getCuisines(userData.id).then(function(cuisineResp) {
      $scope.userCuisines = cuisineResp.data;
    });
  }, function() {
    //if there's an error retrieving user data (bad username?), go to home page for now
    $location.path('/');
  });
});
