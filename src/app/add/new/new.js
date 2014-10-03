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

.controller( 'NewMorselCtrl', function NewMorselCtrl( $scope, templateData ) {
  $scope.templates = templateData;
});