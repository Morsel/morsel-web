angular.module( 'Morsel.public.explore.searchBar', [] )
.directive('mrslExploreSearchBar', function(ApiUsers, SEARCH_CHAR_MINIMUM, $state){
  return {
    scope: {
      exploreSearchForm: '=mrslExploreSearchBar',
      searchModel: '=mrslExploreSearchBarModel',
      placeholder: '@mrslExploreSearchBarPlaceholder',
      customClear: '=mrslExploreSearchBarClear',
      customFocus: '=mrslExploreSearchBarFocus',
      customSearch: '=mrslExploreSearchBarSearch'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.showClear = false;

      //search length validation
      scope.queryLengthValidation = {
        'length': {
          'min': SEARCH_CHAR_MINIMUM,
          'message': 'Search must be at least 3 characters'
        }
      };

      scope.focus = function() {
        scope.showClear = true;
        scope.customFocus();
      };

      scope.$watch('searchModel.query', function(newValue) {
        if(newValue && newValue.length>0) {
          scope.clearText = 'Clear';
        } else {
          scope.clearText = 'Cancel';
        }
      });

      scope.clear = function() {
        scope.searchModel.query = '';
        scope.exploreSearchForm.$setPristine();
        //callback if we want to switch state
        if(scope.customClear) {
          scope.customClear();
        }
      };
    },
    templateUrl: 'app/public/explore/search-bar/search-bar.tpl.html'
  };
});