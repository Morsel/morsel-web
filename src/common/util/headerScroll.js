angular.module( 'Morsel.common.headerScroll', [] )

.constant('HEADER_DETACH_POINT', 300)

.directive('mrslHeaderScroll', function ($document, HEADER_DETACH_POINT) {
  return {
    replace: false,
    scope: false,
    link:function (scope, element, attrs) {
      var scrollYPosition = 0;

      $document.on('scroll', _.throttle(function(e) {
        var newScrollYPosition = $document.scrollTop(),
            scrollDifference = newScrollYPosition - scrollYPosition;

        if(newScrollYPosition <=0) {
          //at top of page
          scope.viewOptions.hideHeader = false;
        } else if(scrollDifference > 0 && newScrollYPosition > HEADER_DETACH_POINT){
          //scrolled down
          scope.viewOptions.hideHeader = true;
          scope.viewOptions.headerDropdownOpen = false;
        } else if(scrollDifference <=0) {
          //scrolled up
          scope.viewOptions.hideHeader = false;
        } else {
          //in case
          scope.viewOptions.hideHeader = false;
        }

        //set our position for next time
        scrollYPosition = newScrollYPosition;

        scope.$apply('viewOptions');
      }, 250));
    }
  };
});