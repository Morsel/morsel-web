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
    resolve: {
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'DraftsCtrl', function DraftsCtrl( $scope, currentUser, MORSEL_LIST_NUMBER, MORSELPLACEHOLDER, ApiMorsels, PhotoHelpers ) {

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

    ApiMorsels.getDrafts(draftsParams).then(function(draftsData) {
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
  $scope.getDrafts();

  $scope.getCoverPhotoArray = function(morsel) {
    var primaryItemPhotos;

    if(morsel && morsel.items) {
      primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(morsel);

      if(primaryItemPhotos) {
        return [
          ['default', primaryItemPhotos._80x80]
        ];
      } else {
        return [
          ['default', MORSELPLACEHOLDER]
        ];
      }
    } else {
      return ['default', MORSELPLACEHOLDER];
    }
  };
});