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

.controller( 'AddMorselCtrl', function AddMorselCtrl( $scope, currentUser, $stateParams, $state, MORSEL_TEMPLATE_DATA_URL, ApiMorsels, PhotoHelpers, $q, HandleErrors, $window, $timeout ) {
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
    $scope.morselDataLoaded = true;

    //figure out which template the morsel uses
    $scope.morselTemplate = _.find(allTemplateData, function(t) {
      return t.id === $scope.morsel.template_id;
    });

    if($scope.morsel.title) {
       //due to current bug in the app, we need to manually check the title against the templates to determine if it actually has a title https://www.pivotaltracker.com/story/show/79033104
      if($scope.morselTemplate && $scope.morselTemplate.title && ($scope.morsel.title === ($scope.morselTemplate.title+' morsel'))) {
        //reset the title
        $scope.morsel.title = null;
        //display the placeholder
        $scope.morsel.displayTitle = $scope.morselTemplate.title;
        $scope.morsel.hasTitle = false;
      } else {
        $scope.morsel.displayTitle = $scope.morsel.title;
        $scope.morsel.hasTitle = true;
      }
    } else {
      //if there isn't a title
      if($scope.morselTemplate && $scope.morselTemplate.title) {
        //use the placeholder if there is one
        $scope.morsel.displayTitle = $scope.morselTemplate.title + ' morsel';
      } else {
        $scope.morsel.displayTitle = 'Untitled morsel';
      }
      
      $scope.morsel.hasTitle = false;
    }

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
});