angular.module( 'Morsel.common.reverse', [] )

.filter('reverse', function() {
  return function(items) {
    return items ? items.slice().reverse() : items;
  };
});