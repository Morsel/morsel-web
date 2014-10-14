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

.controller( 'NewMorselCtrl', function NewMorselCtrl( $scope, currentUser, templateData, ApiMorsels, ApiItems, HandleErrors, $location, $q ) {
  $scope.templates = templateData;

  //catch from our template directive
  $scope.$on('add.morsel', function(e, morselParams) {
    //show a loader
    $scope.creating = true;

    ApiMorsels.createMorsel(morselParams).then(function(resp) {
      var morselData = resp.data,
          //the template this morsel uses
          morselTemplate = _.find($scope.templates, function(t) {
            return t.id === morselData.template_id;
          }),
          itemParams,
          itemPromises = [];

      //create the necessary items from the template
      _.each(morselTemplate.items, function(ti, ind) {
        itemParams = {
          item: {
            morsel_id: morselData.id,
            template_order: ti.template_order,
            sort_order: ind + 1 //make sure they're in order since ajax calls might not be
          }
        };

        itemPromises.push(addItem(itemParams));
      });

      //once all items are created
      $q.all(itemPromises).then(function(resp){
        //increase our count to display in the menu
        currentUser.draft_count++;
        //bring user to add page
        $location.path('/add/morsel/'+morselData.id);
      }, function(resp){
        $scope.creating = false;
        handleErrors(resp);
      });
    }, function(resp) {
      $scope.creating = false;
      handleErrors(resp);
    });
  });

  function addItem(itemParams) {
    return ApiItems.createItem(itemParams).then(function() {}, handleErrors);
  }

  function handleErrors(resp) {
    HandleErrors.onError(resp.data, $scope.newMorselForm);
  }
});