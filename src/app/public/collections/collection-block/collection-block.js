angular.module('Morsel.public.collections.collectionBlock', [])

.directive('mrslCollectionBlock', function(MORSELPLACEHOLDER) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      collection: '=mrslCollectionBlock'
    },
    link: function(scope, element) {
      var numCoverPhotos = 4;

      scope.MORSELPLACEHOLDER = MORSELPLACEHOLDER;

      scope.getFillerCoverPhotos = function(n){
        return new Array(numCoverPhotos-n);
      };
    },
    templateUrl: 'app/public/collections/collection-block/collection-block.tpl.html'
  };
});