angular.module( 'Morsel.common.photoHelpers', [])

//helper methods dealing with morsel photos
.factory('PhotoHelpers', function(MORSELPLACEHOLDER) {
  var photoHelpers = {
    findPrimaryItemPhotos : function(morsel) {
      var primaryItem = _.find(morsel.items, function(i) {
        return i.id === morsel.primary_item_id;
      });

      if(primaryItem && primaryItem.photos) {
        return primaryItem.photos;
      } else {
        return null;
      }
    },
    findLastItemWithPhotos : function(items) {
      var reverseItems = items.slice(0);

      return _.find(reverseItems, function(i) {
        return i.photos;
      });
    },
    getCoverPhotoArray : function(morsel) {
      var primaryItemPhotos;

      if(morsel.items) {
        primaryItemPhotos = photoHelpers.findPrimaryItemPhotos(morsel);

        if(primaryItemPhotos) {
          return [
            ['default', primaryItemPhotos._100x100],
            ['(min-width: 321px)', primaryItemPhotos._240x240]
          ];
        } else {
          return [
            ['default', MORSELPLACEHOLDER]
          ];
        }
      } else {
        return ['default', MORSELPLACEHOLDER];
      }
    }
  };

  return photoHelpers;
});