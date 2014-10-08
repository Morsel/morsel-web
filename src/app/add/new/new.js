angular.module( 'Morsel.add.new', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'add-new', {
    url: '/add',
    views: {
      "main": {
        controller: 'NewMorselCtrl',
        templateUrl: 'app/add/new/new.tpl.html'
      }
    },
    data:{ pageTitle: 'New Morsel' },
    access: {
      restricted : true
    },
    resolve: {
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      },
      templateData: function(ApiMorsels) {
        return ApiMorsels.getTemplates().then(function(templateData) {
          return templateData;
        }, function() {
          //if there's an error retrieving a morsel, go to drafts
          $state.go('drafts');
        });
      }
    }
  });
})

.controller( 'NewMorselCtrl', function NewMorselCtrl( $scope, currentUser, templateData, ApiMorsels, HandleErrors, $location ) {
  $scope.templates = templateData;

  //catch from our template directive
  $scope.$on('add.morsel', function(e, morselParams) {
    //show a loader
    $scope.creating = true;

    ApiMorsels.createMorsel(morselParams).then(function(resp) {
      var morselData = resp.data;
      //increase our count to display in the menu
      currentUser.draft_count++;
      //bring user to add page
      $location.go('/add/morsel/'+morselData.id);
    }, function(resp) {
      $scope.creating = false;
      HandleErrors.onError(resp.data, $scope.newMorselForm);
    });
  });
});