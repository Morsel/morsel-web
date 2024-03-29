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

.controller( 'DraftsCtrl', function DraftsCtrl( $scope, currentUser, MORSELPLACEHOLDER, ApiMorsels, PhotoHelpers, $q, $state ) {
  var draftPromises = [],
      allTemplateData,
      draftsWatch,
      draftsLoadDeferred = $q.defer();

  //watch when we get drafts
  draftsWatch = $scope.$watch('drafts', function(newValue) {
    if(newValue) {
      draftsLoadDeferred.resolve();
      //stop watching
      draftsWatch();
    }
  });

  //load drafts
  draftPromises.push(draftsLoadDeferred.promise);
  //load templates
  draftPromises.push(getMorselTemplates());

  $scope.getDrafts = function(params) {
    ApiMorsels.getDrafts(params).then(function(draftsResp) {
      if($scope.drafts) {
        //concat them with new data after old data
        $scope.drafts = $scope.drafts.concat(draftsResp.data);
      } else {
        $scope.drafts = draftsResp.data;
      }

      //we need to call this each time
      readyDraftsForDisplay();
    }, function() {
      //if there's an error retrieving drafts, go to 404
      $state.go('404');
    });
  };

  //once all promises are resolved
  $q.all(draftPromises).then(dataLoaded);

  function getMorselTemplates() {
    return ApiMorsels.getTemplates().then(function(templateResp) {
      allTemplateData = templateResp.data;
    });
  }

  function dataLoaded() {
    $scope.dataLoaded = true;
    readyDraftsForDisplay();
  }

  function readyDraftsForDisplay() {
    //got some data manipulation to do
    _.each($scope.drafts, function(draft) {
      //associate the draft
      if(draft.template_id) {
        draft.displayTemplate = _.find(allTemplateData, function(t){
          return t.id === draft.template_id;
        });
      }

      if(draft.title) {
         //due to current bug in the app, we need to manually check the title against the templates to determine if it actually has a title https://www.pivotaltracker.com/story/show/79033104
        if(draft.displayTemplate && draft.displayTemplate.title && (draft.title === (draft.displayTemplate.title+' morsel'))) {
          //display the placeholder
          draft.title = draft.displayTemplate.title + ' morsel';
          draft.hasTitle = false;
        } else {
          draft.hasTitle = true;
        }
      } else {
        draft.hasTitle = false;

        //if there isn't a title
        if(draft.displayTemplate && draft.displayTemplate.title) {
          //use the placeholder if there is one
          draft.title = draft.displayTemplate.title + ' morsel';
        } else {
          draft.title = 'Untitled morsel';
        }
      }
    });
  }

  $scope.getCoverPhotoArray = function(morsel) {
    var primaryItemPhotos,
        primaryItem,
        primaryItemTemplate;

    if(morsel && morsel.items) {
      primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(morsel);

      if(primaryItemPhotos && primaryItemPhotos._100x100) {
        return [
          ['default', primaryItemPhotos._100x100]
        ];
      } else {
        //if the morsel has a template, we should use a photo from that
        if(morsel.displayTemplate) {
          //use the primary_item's placeholder, if available
          if(morsel.primary_item_id) {
            primaryItem = _.find(morsel.items, function(i){
              return i.id === morsel.primary_item_id;
            });

            if(primaryItem.template_order) {
              primaryItemTemplate = _.find(morsel.displayTemplate.items, function(i){
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