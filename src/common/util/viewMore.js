angular.module( 'Morsel.common.viewMore', [
])
.directive('mrslViewMore', function () {
  return {
    scope: {
      viewMoreFunc: '=mrslViewMoreFunc',
      viewMoreData: '=mrslViewMoreData',
      viewMoreInc: '=mrslViewMoreInc',
      viewMoreCopy: '@mrslViewMoreCopy'
    },
    link:function (scope, element, attrs) {
      scope.loading = false;
      scope.allDataLoaded = false;

      scope.$watch('viewMoreData', function(newValue, oldValue) {
        var nothingNew = _.isEqual(newValue, oldValue),
            //did less than the expected number of new data load? meaning we reached the end of the data
            lessThanIncrement = newValue && ((newValue.length - (oldValue ? oldValue.length : 0)) < scope.viewMoreInc);

        scope.loading = false;

        if(newValue && (nothingNew || lessThanIncrement)) {
          scope.allDataLoaded = true;
        }
      });

      scope.loadMore = function() {
        scope.loading = true;
        scope.viewMoreFunc(_.last(scope.viewMoreData).id);
      };
    },
    templateUrl: 'common/util/viewMore.tpl.html'
  };
});