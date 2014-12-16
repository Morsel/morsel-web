angular.module('Morsel.public.collections.collectionBlock', [])

.directive('mrslCollectionBlock', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      collection: '=mrslCollectionBlock'
    },
    link: function(scope, element) {
    },
    templateUrl: 'app/public/collections/collection-block/collection-block.tpl.html'
  };
});