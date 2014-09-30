angular.module( 'Morsel.add.morsel', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'add-morsel', {
    url: '/add/morsel/:morselId',
    views: {
      "main": {
        controller: 'AddMorselCtrl',
        templateUrl: 'app/add/morsel/morsel.tpl.html'
      }
    },
    data:{ pageTitle: 'Morsel Checklist' },
    access: {
      restricted : true
    },
    resolve: {
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'AddMorselCtrl', function AddMorselCtrl( $scope, currentUser, $stateParams, $state, ApiMorsels, PhotoHelpers, $q, HandleErrors, $window, $timeout, ApiItems ) {
  var morselPromises = [],
      allTemplateData,
      unloadText = 'You have unsaved data.';

  $scope.viewOptions.miniHeader = true;

  //saved morsel data
  morselPromises.push(getMorsel());
  //general morsel template data
  morselPromises.push(getMorselTemplates());
  //once all promises are resolved
  $q.all(morselPromises).then(dataLoaded);

  function getMorsel() {
    return ApiMorsels.getMorsel($stateParams.morselId).then(function(morselData) {
      $scope.morsel = morselData;
    }, function() {
      //if there's an error retrieving a morsel, go to drafts
      $state.go('drafts');
    });
  }

  function getMorselTemplates() {
    return ApiMorsels.getTemplates().then(function(templateData) {
      allTemplateData = templateData;
    }, function() {
      //if there's an error retrieving a morsel, go to drafts
      $state.go('drafts');
    });
  }

  function dataLoaded() {
    //figure out which template the morsel uses
    $scope.morselTemplate = _.find(allTemplateData, function(t) {
      return t.id === $scope.morsel.template_id;
    });

    //figure out which template each item uses and add it to the morsel
    _.each($scope.morsel.items, function(item) {
      if($scope.morselTemplate && $scope.morselTemplate.items) {
        item.displayTemplate = _.find($scope.morselTemplate.items, function(templateItem) {
          return templateItem.template_order === item.template_order;
        });
      } else {
        item.displayTemplate = null;
      }
    });

    //finally, show any directives with our data
    $scope.morselDataLoaded = true;
  }

  //handle form errors
  $scope.$on('add.error', function(event, resp){
    HandleErrors.onError(resp.data, $scope.morselEditForm);
  });

  //submit our form
  $scope.publish = function() {
    //check if everything is valid
    if($scope.morselDataLoaded && $scope.morselEditForm.$valid) {
      //disable form while request fires
      $scope.morselEditForm.$setValidity('loading', false);

      //call our publishMorsel method to take care of the heavy lifting
      ApiMorsels.publishMorsel($scope.morsel.id).then(onPublishSuccess, onPublishError);
    }
  };

  function onPublishSuccess(morselData) {
    //temporary check to determine if a morsel has been published
    if(_.isEmpty(morselData.mrsl) || _.isEmpty(morselData.photos)) {
      $timeout(function() {
        ApiMorsels.getMorsel(morselData.id).then(onPublishSuccess);
      }, 500);
    } else {
      //bring user to morsel detail
      //remove onbeforeunload so user doesn't get blocked going to morsel detail page
      $window.onbeforeunload = undefined;
      $window.location.href = '/'+morselData.creator.username.toLowerCase()+'/'+morselData.id+'-'+morselData.slug;
    }
  }

  function onPublishError(resp) {
    //make form valid again (until errors show)
    $scope.morselEditForm.$setValidity('loading', true);
    
    //remove whatever message is there
    $scope.alertMessage = null;

    HandleErrors.onError(resp.data, $scope.morselEditForm);
  }

  //stop user if they try to leave the page with an invalid form
  function handleOnbeforeUnload() {
    if ($scope.morselEditForm.$invalid) {
      return unloadText;
    } else {
      return undefined;
    }
  }

  $window.onbeforeunload = handleOnbeforeUnload;

  $scope.$on('$destroy', function() {
    $window.onbeforeunload = undefined;
  });

  //need to check for internal routes also
  //why is this firing twice??
  /*
  $scope.$on('$locationChangeStart', function(event, next, current) {
    if ($scope.morselEditForm.$invalid) {
      if(!$window.confirm(unloadText+' Your data will not be saved if you continue.')) {
        event.preventDefault();
      }
    }
  });
  */

  //our custom tooltip messaging
  $scope.customPublishTooltips = [
    {
      'errorName': 'itemPhotoDoneUploading',
      'message': 'Images are still uploading. Please try again shortly'
    },
    {
      'errorName': 'itemDescriptionSaved',
      'message': 'All descriptions must be saved before continuing'
    },
    {
      'errorName': 'morselHasTitle',
      'message': 'Your morsel must have a title'
    },
    {
      'errorName': 'morselTitleSaved',
      'message': 'Your morsel\'s title must be saved before continuing'
    },
    {
      'errorName': 'itemHasPhoto',
      'message': 'All items must have photos to publish. Please add photos or delete unused items using the app'
    }
  ];

  $scope.addItem = function() {
    var itemParams = {
      item: {
        morsel_id: $scope.morsel.id
      }
    };

    $scope.addingItem = true;

    ApiItems.createItem(itemParams).then(function(itemResp) {
      if($scope.morsel.items) {
        $scope.morsel.items.push(itemResp.data);
      } else {
        $scope.morsel.items = [itemResp.data];
      }
      $scope.addingItem = false;
    }, function(resp) {
      $scope.addingItem = false;
      HandleErrors.onError(resp.data, $scope.morselEditForm);
    });
  };
});