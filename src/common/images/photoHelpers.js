angular.module( 'Morsel.common.photoHelpers', [])

//helper methods dealing with morsel photos
.factory('PhotoHelpers', function(MORSELPLACEHOLDER) {
  var photoHelpers = {
    findPrimaryItemPhotos : function(morsel) {
      return (morsel && morsel.primary_item_photos) ? morsel.primary_item_photos : null;
    },
    getCoverPhotoArray : function(morsel) {
      var primaryItemPhotos = photoHelpers.findPrimaryItemPhotos(morsel);

      if(primaryItemPhotos) {
        return [
          ['default', primaryItemPhotos._100x100],
          ['(min-width: 321px)', primaryItemPhotos._320x320]
        ];
      } else {
        return ['default', MORSELPLACEHOLDER];
      }
    }
  };

  return photoHelpers;
});