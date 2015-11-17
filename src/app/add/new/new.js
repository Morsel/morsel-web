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
    data:{ pageTitle: 'New morsel' },
    access: {
      restricted : true
    },
    resolve: {
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      },
      templateData: function(ApiMorsels) {
        return ApiMorsels.getTemplates().then(function(templateResp) {
          return templateResp.data;
        }, function() {
          //if there's an error retrieving a morsel, go to drafts
          $state.go('drafts');
        });
      }
    }
  });
}).config(function config( $stateProvider ) {
  $stateProvider.state( 'addnew', {
    url: '/addnew',
    views: {
      "main": {
        controller: 'NewMorselCtrl',
        templateUrl: 'app/add/new/new-tmp.tpl.html'
      }
    },
    data:{ pageTitle: 'New morsel' },
    access: {
      restricted : true
    },
    resolve: {
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      },
      templateData: function(ApiMorsels) {
        return ApiMorsels.getTemplates().then(function(templateResp) {
          return templateResp.data;
        }, function() {
          //if there's an error retrieving a morsel, go to drafts
          $state.go('drafts');
        });
      }
    }
  });
})

.controller( 'NewMorselCtrl', function NewMorselCtrl( $scope, currentUser, templateData, ApiMorsels, ApiItems, HandleErrors, $location, $q ) {
  var newMorselData,
      newMorselTemplate;
  $scope.templates = templateData;

  //catch from our template directive
  $scope.$on('add.morsel', function(e, morselParams) {
    //show a loader
    $scope.creating = true;

    ApiMorsels.createMorsel(morselParams).then(function(resp) {
      var itemPromises = [],
          //the template order of the last item
          lastTemplateOrder;

      newMorselData = resp.data;
      //find the template of the new morsel
      newMorselTemplate = _.find($scope.templates, function(t) {
        return t.id === newMorselData.template_id;
      });

      //create the necessary items from the template
      _.each(newMorselTemplate.items, function(ti, ind) {
        var itemParams = {
              item: {
                morsel_id: newMorselData.id,
                template_order: ti.template_order,
                sort_order: ind + 1 //make sure they're in order since ajax calls might not be
              }
            };

        if(ind === newMorselTemplate.items.length-1){
          lastTemplateOrder = ti.template_order;
        }

        itemPromises.push(addItem(itemParams));
      });

      //once all items are created
      $q.all(itemPromises).then(function(resp){
        var morselParams = {
              morsel: {
                //set the last item as the primary
                primary_item_id: _.findWhere(newMorselData.items, {template_order:lastTemplateOrder}).id
              }
            };

        //set the last item as the primary
        ApiMorsels.updateMorsel(newMorselData.id, morselParams).then(function(){
          //increase our count to display in the menu
          currentUser.draft_count++;
          //bring user to add page
          $location.path('/add/morsel/'+newMorselData.id);
        }, function(resp) {
          $scope.creating = false;
          handleErrors(resp);
        });
      }, function(resp) {
        $scope.creating = false;
        handleErrors(resp);
      });
    }, function(resp) {
      $scope.creating = false;
      handleErrors(resp);
    });
  });

  function addItem(itemParams) {
    return ApiItems.createItem(itemParams).then(function(resp) {
      newMorselData.items.push(resp.data);
    }, handleErrors);
  }

  function handleErrors(resp) {
    HandleErrors.onError(resp.data, $scope.newMorselForm);
  }
});
