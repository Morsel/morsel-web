/*
 * Based off: http://github.com/revolunet/angular-carousel
*/

angular.module('Morsel.common.feedSwipe', [
  'ngTouch'
])

.directive('feedControls', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      count: '=',
      index: '='
    },
    link: function(scope, element, attrs) {
      scope.prev = function() {
        scope.index--;
      };
      scope.next = function() {
        scope.index++;
      };
    },
    template: '<div>' +
                '<span class="feed-control feed-control-prev" ng-click="prev()" ng-if="index > 0"></span>' +
                '<span class="feed-control feed-control-next" ng-click="next()" ng-if="index < count - 1"></span>' +
              '</div>'
  };
}])

.directive('feedSwipe', function($window, $document, Transform) {
  var // used to compute the sliding speed
      timeConstant = 75,
      // in container % how much we need to drag to trigger the slide change
      moveTreshold = 0.05,
      // in absolute pixels, at which distance the slide stick to the edge on release
      rubberTreshold = 3,
      //max time between scrolls
      scrollThreshold = 500,
      //use a debounce function so keydown events don't fire multiple times
      keyDebounceTime = 350;

  return {
    restrict: 'A',
    scope: true,
    link: function(scope, iElement, iAttributes) {
      var pressed = false,
          startX,
          amplitude,
          timestamp,
          offset = 0,
          feedWidth,
          destination,
          swipeXMoved = false,
          winEl = angular.element($window),
          lastScrollTimestamp,
          feedItems;

      updatefeedWidth();

      //our scope vars, accessible by indicators
      scope.currentMorselIndex = 0; //track which morsel we're on
      scope.currentControlIndex = 0; //track which indicator is active
      scope.morselsCount = 0;
      scope.feedBufferIndex = 0;
      scope.feedBufferSize = 3;

      //set up our scope watches
      //watch our feed items
      scope.$watchCollection('feedItems', function(newValue, oldValue) {
        scope.morselsCount = 0;
        if (angular.isArray(newValue)) {
          feedItems = newValue;
          scope.morselsCount = feedItems.length;
        } else if (angular.isObject(newValue)) {
          feedItems = Object.keys(newValue);
          scope.morselsCount = feedItems.length;
        }
        
        goToSlide(scope.currentMorselIndex);
      });

      //watch for changes from the controls
      scope.$watch('currentControlIndex', function(newValue) {
        goToSlide(newValue, true);
      });

      //make sure our control index is updated when we change morsels
      scope.$watch('currentMorselIndex', function(newValue) {
        scope.currentControlIndex = newValue;
      });

      // handle orientation change
      winEl.bind('orientationchange', onOrientationChange);
      winEl.bind('resize', onOrientationChange);

      scope.$on('$destroy', function() {
        winEl.unbind('orientationchange', onOrientationChange);
        winEl.unbind('resize', onOrientationChange);
      });

      //our swiping functions
      scope.swipeStarted = function(coords) {
        pressed = true;
        startX = coords.x;

        amplitude = 0;
        timestamp = Date.now();
      };

      scope.swipeMoved = function(coords) {
        var x,
            xDelta;

        if (pressed) {
          x = coords.x;
          xDelta = startX - x;

          if (xDelta > 2 || xDelta < -2) {
            swipeXMoved = true;
            startX = x;
            requestAnimationFrame(function() {
              scroll(capPosition(offset + xDelta));
            });
          }
        }
      };

      scope.swipeEnded = function(coords, forceAnimation) {
        var currentOffset,
            absMove,
            morselsMove,
            shouldMove,
            moveOffset;

        /*if(!pressed) {
          pressed = false;
          return;
        }*/

        pressed = false;
        swipeXMoved = false;
        destination = offset;
        currentOffset = (scope.currentMorselIndex * feedWidth);
        absMove = currentOffset - destination;
        morselsMove = -Math[absMove>=0?'ceil':'floor'](absMove / feedWidth);
        shouldMove = Math.abs(absMove) > getAbsMoveTreshold();

        if ((morselsMove + scope.currentMorselIndex) >= scope.morselsCount ) {
          morselsMove = scope.morselsCount - 1 - scope.currentMorselIndex;
        }
        if ((morselsMove + scope.currentMorselIndex) < 0) {
          morselsMove = -scope.currentMorselIndex;
        }
        
        moveOffset = shouldMove ? morselsMove : 0;

        destination = (moveOffset + scope.currentMorselIndex) * feedWidth;
        amplitude = destination - offset;
        timestamp = Date.now();
        if (forceAnimation) {
          amplitude = offset - currentOffset;
        }
        requestAnimationFrame(autoScroll);
      };

      //helpers
      function capPosition(position) {
        // limit position if start or end of slides
        if (scope.currentMorselIndex===0) {
          position = Math.max(-getAbsMoveTreshold(), position);
        } else if (scope.currentMorselIndex===scope.morselsCount-1) {
          position = Math.min(((scope.morselsCount-1)*feedWidth + getAbsMoveTreshold()), position);
        }
        return position;
      }

      function capIndex(idx) {
        // ensure given index it inside bounds
        return (idx >= scope.morselsCount) ? scope.morselsCount: (idx <= 0) ? 0 : idx;
      }

      function updateBufferIndex() {
        // update and cap the buffer index
        var bufferIndex = 0;
        var bufferEdgeSize = (scope.feedBufferSize - 1) / 2;

        if (scope.currentMorselIndex <= bufferEdgeSize) {
          bufferIndex = 0;
        } else if (scope.morselsCount < scope.feedBufferSize) {
          bufferIndex = 0;
        } else if (scope.currentMorselIndex > scope.morselsCount - scope.feedBufferSize) {
          bufferIndex = scope.morselsCount - scope.feedBufferSize;
        } else {
          bufferIndex = scope.currentMorselIndex - bufferEdgeSize;
        }

        scope.feedBufferIndex = bufferIndex;
      }

      function getAbsMoveTreshold() {
        // return min pixels required to move a slide
        return moveTreshold * feedWidth;
      }

      function updatefeedWidth() {
        feedWidth = window.innerWidth;
      }

      //keep this here so you don't fire a scroll event in each morsel as you switch
      scope.checkLastScroll = function() {
        //make sure this scroll should have an effect
        var scrollValid = false;

        if(Date.now() - (lastScrollTimestamp || 0) > scrollThreshold) {
          scrollValid = true;
          lastScrollTimestamp = Date.now();
        }

        return scrollValid;
      };

      //scrolling
      function scroll(x) {
        // use CSS 3D transform to move the screen
        if (isNaN(x)) {
          x = scope.currentMorselIndex * feedWidth;
        }

        offset = x;
        var move = -Math.round(offset);

        move += (scope.feedBufferIndex * feedWidth);
        iElement.find('ul')[0].style[Transform.getProperty()] = 'translate3d(' + move + 'px, 0, 0)';
      }

      function autoScroll() {
        // scroll smoothly to "destination" until we reach it
        // using requestAnimationFrame
        var elapsed,
            delta;

        if (amplitude) {
          elapsed = Date.now() - timestamp;
          delta = amplitude * Math.exp(-elapsed / timeConstant);
          if (delta > rubberTreshold || delta < -rubberTreshold) {
            scroll(destination - delta);
            requestAnimationFrame(autoScroll);
          } else {
            goToSlide(destination / feedWidth);
          }
        }
      }

      function goToSlide(i, animate) {
        var thisFeedItem;

        if (isNaN(i)) {
          i = scope.currentMorselIndex;
        }
        if (animate) {
          // simulate a swipe so we have the standard animation
          // used when external binding index is updated or touch canceed
          offset = (i * feedWidth);
          scope.swipeEnded(null, true);
          return;
        }
        scope.currentMorselIndex = capIndex(i);
        updateBufferIndex();
        //emit where we are so we can go fetch more data
        scope.$emit('feed.atMorsel', scope.currentMorselIndex);

        if(feedItems) {
          thisFeedItem = feedItems[scope.currentMorselIndex];

          if(thisFeedItem) {
            //broadcast that we've switched so we can update our feedstate
            scope.$broadcast('feed.switchedMorsels', thisFeedItem.subject.id);
          }
        }
        
        
        // if outside of angular scope, trigger angular digest cycle
        // use local digest only for perfs if no index bound
        if (scope.$$phase!=='$apply' && scope.$$phase!=='$digest') {
          scope.$digest();
        }
        scroll();
      }

      //for moving elsewhere in scope
      scope.goToPrevMorsel = function() {
        //move to the previous morsel if we're not on the first
        if(scope.currentMorselIndex !== 0) {
          goToSlide(scope.currentMorselIndex-1, true);
        }
      };

      scope.goToNextMorsel = function() {
        //move to the next morsel if we're not on the last
        if(scope.currentMorselIndex !== scope.morselsCount-1) {
          goToSlide(scope.currentMorselIndex+1, true);
        }
      };

      function onOrientationChange() {
        goToSlide();
      }

      //handle navigation for left and right keypresses
      function handleKeydown(e) {
        //ignore if it it's not coming from the body (could be in an input, etc)
        if(e.srcElement.tagName === 'BODY') {
          if(e.which === 37) {
            //left arrow pressed
            scope.goToPrevMorsel();
          } else if(e.which === 39) {
            //right arrow pressed
            scope.goToNextMorsel();
          }
        }
      }

      debouncedKeydown = _.debounce(handleKeydown, keyDebounceTime, true);
      $document.on('keydown', debouncedKeydown);

      // unbind keydown event when user leaves
      scope.$on('$destroy', function(){
        $document.off('keydown', debouncedKeydown);
      });
    }
  };
})

.filter('feedSlice', function() {
  return function(collection, start, size) {
    return collection.slice(start, start + size);
  };
});