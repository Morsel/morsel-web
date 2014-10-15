angular.module( 'Morsel.add.drafts', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'drafts', {
    url: '/add/drafts',
    views: {
      "main": {
        controller: 'DraftsCtrl',
        templateUrl: 'app/add/drafts/drafts.tpl.html'
      }
    },
    data:{ pageTitle: 'Your Drafts' },
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

.controller( 'DraftsCtrl', function DraftsCtrl( $scope, currentUser, MORSEL_LIST_NUMBER, MORSELPLACEHOLDER, ApiMorsels, PhotoHelpers, $q ) {
  var draftPromises = [],
      allTemplateData;

  //# of drafts to load at a time
  $scope.draftIncrement = MORSEL_LIST_NUMBER;

  $scope.getDrafts = function(endDraft) {
    var draftsParams = {
          count: $scope.draftIncrement
        };

    if(endDraft) {
      draftsParams.before_id = endDraft.id;
      draftsParams.before_date = endDraft.updated_at;
    }

    return ApiMorsels.getDrafts(draftsParams).then(function(draftsData) {
      if($scope.drafts) {
        //concat them with new data after old data, then reverse with a filter
        $scope.drafts = $scope.drafts.concat(draftsData);
      } else {
        $scope.drafts = draftsData;
      }
    }, function() {
      //if there's an error retrieving drafts, go to 404
      $state.go('404');
    });
  };

  //load drafts
  draftPromises.push($scope.getDrafts());
  //load templates
  draftPromises.push(getMorselTemplates());

  //once all promises are resolved
  $q.all(draftPromises).then(dataLoaded);

  function getMorselTemplates() {
    return ApiMorsels.getTemplates().then(function(templateData) {
      allTemplateData = templateData;
    });
  }

  function dataLoaded() {
    _.each($scope.drafts, function(draft) {
    });
  }

  $scope.getCoverPhotoArray = function(morsel) {
    var primaryItemPhotos,
        primaryItem,
        morselTemplate,
        primaryItemTemplate;

    if(morsel && morsel.items) {
      primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(morsel);

      if(primaryItemPhotos && primaryItemPhotos._80x80) {
        return [
          ['default', primaryItemPhotos._80x80]
        ];
      } else {
        //if the morsel has a template, we should use a photo from that
        if(morsel.template_id) {
          morselTemplate = _.find(allTemplateData, function(t){
            return t.id === morsel.template_id;
          });

          //use the primary_item's placeholder, if available
          if(morsel.primary_item_id) {
            primaryItem = _.find(morsel.items, function(i){
              return i.id === morsel.primary_item_id;
            });

            if(primaryItem.template_order) {
              primaryItemTemplate = _.find(morselTemplate.items, function(i){
                return primaryItem.template_order === i.template_order;
              });

              if(primaryItemTemplate && primaryItemTemplate.placeholder_photos && primaryItemTemplate.placeholder_photos.medium) {
                return [
                  ['default', primaryItemTemplate.placeholder_photos.medium]
                ];
              } else {
                return [
                  ['default', MORSELPLACEHOLDER]
                ];
              }
            } else {
              return [
                ['default', MORSELPLACEHOLDER]
              ];
            }
          } else {
            return [
              ['default', MORSELPLACEHOLDER]
            ];
          }
        } else {
          return [
            ['default', MORSELPLACEHOLDER]
          ];
        }
      }
    } else {
      return ['default', MORSELPLACEHOLDER];
    }
  };
});