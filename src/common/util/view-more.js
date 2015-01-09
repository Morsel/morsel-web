angular.module( 'Morsel.common.viewMore', [
])

.constant('USER_LIST_NUMBER', 20)
.constant('USER_UPDATE_CHECK_TIME', 5000)
.constant('COMMENT_LIST_NUMBER', 5)
.constant('MORSEL_LIST_NUMBER', 12)
.constant('HASHTAG_LIST_NUMBER', 10)
.constant('ACTIVITY_LIST_NUMBER', 20)
.constant('COLLECTIONS_LIST_NUMBER', 12)
.constant('FEED_LIST_NUMBER', 9)

.directive('mrslViewMore', function (Mixpanel, MORSEL_LIST_NUMBER, USER_LIST_NUMBER, ACTIVITY_LIST_NUMBER, COMMENT_LIST_NUMBER, HASHTAG_LIST_NUMBER, COLLECTIONS_LIST_NUMBER, FEED_LIST_NUMBER) {
  return {
    restrict: 'A',
    scope: {
      loadFunc: '=mrslViewMore',
      data: '=mrslViewMoreData',
      //optional
      copy: '@mrslViewMoreCopy',
      listType: '@mrslViewMoreListType',
      view: '@mrslViewMoreView',
      btnLink: '@mrslViewMoreAsLink',
      increment: '=?mrslViewMoreInc',
      timeline: '@mrslViewMoreTimeline',
      delayStart: '@mrslViewMoreDelay'
    },
    link:function (scope, element, attrs) {
      scope.loading = false;
      scope.allDataLoaded = false;

      if(!scope.increment) {
        switch(scope.listType) {
          case 'Comments':
            scope.increment = COMMENT_LIST_NUMBER;
            break;

          case 'Hashtags':
            scope.increment = HASHTAG_LIST_NUMBER;
            break;

          case 'FeedItems':
            scope.increment = FEED_LIST_NUMBER;
            break;

          case 'Collections':
            scope.increment = COLLECTIONS_LIST_NUMBER;
            break;

          case 'Users':
            scope.increment = USER_LIST_NUMBER;
            break;

          case 'Activities':
          case 'Notifications':
            scope.increment = ACTIVITY_LIST_NUMBER;
            break;

          default:
          case 'Morsels':
            scope.increment = MORSEL_LIST_NUMBER;
            break;
        }
      }

      scope.$watch('data', function(newValue, oldValue) {
        var nothingNew = _.isEqual(newValue, oldValue),
            //did less than the expected number of new data load? meaning we reached the end of the data
            lessThanIncrement = newValue && ((newValue.length - (oldValue ? oldValue.length : 0)) < scope.increment);

        scope.loading = false;

        if(newValue && (nothingNew || lessThanIncrement)) {
          scope.allDataLoaded = true;
        } else {
          scope.allDataLoaded = false;
        }
      });

      scope.loadMore = function() {
        var mixpanelProps = {
              list_type: scope.listType,
              view: scope.view
            },
            loadMoreParams = {
              count: scope.increment
            };

        scope.loading = true;

        //keep track of the page number
        //start at 1 if there isn't one already, or 2 if we delayed start
        //timeline pagination doesn't use it, but keep it for mixpanel
        scope.pageNumber = scope.pageNumber ? scope.pageNumber+1 : (scope.delayStart ? 2 : 1);
        mixpanelProps.page_number = scope.pageNumber;

        if(scope.timeline) {
          if(scope.data) {
            //find our last id
            loadMoreParams.max_id = parseInt(_.last(scope.data).id, 10) - 1;
          }
          
          //pass back "last" item to our loading function (which it may or may not use) to determine what to load next
          scope.loadFunc(loadMoreParams);
        } else {
          loadMoreParams.page = scope.pageNumber;
          scope.loadFunc(loadMoreParams);
        }

        Mixpanel.track('Clicked View More', mixpanelProps);
      };

      if(!scope.delayStart) {
        //perform initial data load
        scope.loadMore();
      }
    },
    templateUrl: 'common/util/view-more.tpl.html'
  };
});