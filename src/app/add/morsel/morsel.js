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

.controller( 'AddMorselCtrl', function AddMorselCtrl( $scope, currentUser, $stateParams, $state, MORSELPLACEHOLDER, MORSEL_TEMPLATE_DATA_URL, ApiMorsels, PhotoHelpers, $q ) {
  var morselPromises = [],
      allTemplateData;

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
      if($scope.morsel.title === ($scope.morselTemplate.title+' morsel')) {
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
      //if there isn't a title, use the placeholder
      $scope.morsel.displayTitle = $scope.morselTemplate.title;
      $scope.morsel.hasTitle = false;
    }

    //figure out which template each item uses and add it to the morsel
    _.each($scope.morsel.items, function(item) {
      item.displayTemplate = _.find($scope.morselTemplate.items, function(templateItem) {
        return templateItem.template_order === item.template_order;
      });
    });
  }

  $scope.findItemThumbnail = function(item) {
    if(item.photos && item.photos._100x100) {
      return item.photos._100x100;
    } else if(item.displayTemplate && item.displayTemplate.placeholder_photos && item.displayTemplate.placeholder_photos.large) {
      return item.displayTemplate.placeholder_photos.large;
    } else {
      return MORSELPLACEHOLDER;
    }
  };
});