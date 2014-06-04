angular.module( 'Morsel.account.editProfile', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'account.edit-profile', {
    url: '/edit-profile',
    parent: 'account',
    views: {
      "account-body": {
        controller: 'EditProfileCtrl',
        templateUrl: 'app/account/editProfile/editProfile.tpl.html'
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

.controller( 'EditProfileCtrl', function EditProfileCtrl( $scope, $stateParams, ApiUsers, ApiKeywords, HandleErrors, $window, accountUser, $q, Auth){
  var allCuisinesPromise,
      userCuisinesPromise,
      allCuisines,
      userCuisines,
      allSpecialtiesPromise,
      userSpecialtiesPromise,
      allSpecialties,
      userSpecialties;

  //basic info

  //model to store our profile data
  $scope.basicInfoModel = _.clone(accountUser);
  $scope.profilePhoto = null;
  $scope.isChef = Auth.isChef();

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
    //make form valid again
    $scope.basicInfoForm.$setValidity('loading', true);

    //update our scoped current user
    Auth.updateUser(resp.data);
    $scope.alertMessage = 'Successfully updated your basic info';
    $scope.alertType = 'success';
  }

  function onBasicInfoError(resp) {
    //make form valid again (until errors show)
    $scope.basicInfoForm.$setValidity('loading', true);
      
    HandleErrors.onError(resp, $scope.basicInfoForm);
  }

  //only chef's have cuisines and specialities
  if($scope.isChef) {

    //cuisines

    //get all the cuisines
    allCuisinesPromise = getAllCuisines();
    //get the cuisines the user has
    userCuisinesPromise = getUserCuisines();

    //when all cuisine data has returned
    $q.all([allCuisinesPromise, userCuisinesPromise]).then(function(){
      //an array of objects of form {keyword:{}, tag:{}}
      $scope.cuisineList = constructList(allCuisines, userCuisines);
    });

    //specialties
    //get all the specialties
    allSpecialtiesPromise = getAllSpecialties();
    //get the specialties the user has
    userSpecialtiesPromise = getUserSpecialties();

    //when all specialty data has returned
    $q.all([allSpecialtiesPromise, userSpecialtiesPromise]).then(function(){
      //an array of objects of form {keyword:{}, tag:{}}
      $scope.specialtyList = constructList(allSpecialties, userSpecialties);
    });
  }

  function getAllCuisines() {
    var deferred = $q.defer();

    ApiKeywords.getAllCuisines().then(function(allCuisineResp){
      allCuisines = allCuisineResp.data;
      deferred.resolve();
    });

    return deferred.promise;
  }

  function getUserCuisines() {
    var deferred = $q.defer();

    ApiUsers.getCuisines(accountUser.id).then(function(userCuisineResp){
      userCuisines = userCuisineResp.data;
      deferred.resolve();
    });

    return deferred.promise;
  }

  function getAllSpecialties() {
    var deferred = $q.defer();

    ApiKeywords.getAllSpecialties().then(function(allSpecialtyResp){
      allSpecialties = allSpecialtyResp.data;
      deferred.resolve();
    });

    return deferred.promise;
  }

  function getUserSpecialties() {
    var deferred = $q.defer();

    ApiUsers.getSpecialties(accountUser.id).then(function(userSpecialtyResp){
      userSpecialties = userSpecialtyResp.data;
      deferred.resolve();
    });

    return deferred.promise;
  }

  //tag helpers
  function constructList(allKeywords, userTags) {
    var list = [];

    _.each(allKeywords, function(keyword) {
      var matchingTag = findTagByKeywordId(userTags, keyword.id);

      list.push({
        keyword: keyword,
        name: keyword.name,
        tag: matchingTag,
        isChecked: matchingTag ? true : false
      });
    });

    return list;
  }

  function findTagByKeywordId(tags, keywordId) {
    return _.find(tags, function(tag) {
      return tag.keyword.id === keywordId;
    });
  }

  function userHasKeyword(tags, id) {
    //does the keyword id match one of the tags' keywords?
    var keywordMatch = _.find(tags, function(tag) {
      return tag.keyword.id === id;
    });

    return keywordMatch ? true : false;
  }

  $scope.toggleTag = function(item) {
    //check our model
    if(item.isChecked) {
      //user toggled on, create tag
      ApiKeywords.createUserTag(accountUser.id, item.keyword.id).then(function(newTagResp){
        //confirmed delete, update local array
        item.tag = newTagResp.data;
      });
    } else {
      //user toggled off, delete tag
      ApiKeywords.deleteUserTag(accountUser.id, item.tag.id).then(function(resp){
        //confirmed delete, update local array
        item.tag = null;
      });
    }
  };
});
