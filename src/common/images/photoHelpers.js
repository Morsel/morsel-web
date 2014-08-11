angular.module( 'Morsel.common.photoHelpers', [])

//helper methods dealing with morsel photos
.factory('PhotoHelpers', function() {
  return {
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
    }
  };
});