angular.module('Morsel.storySwipe', [
  'ngTouch'
])

.directive('storySwipe', ['swipe', '$window', '$document', '$parse', '$compile', function($swipe, $window, $document, $parse, $compile) {
  var // used to compute the sliding speed
      timeConstant = 75,
      // in container % how much we need to drag to trigger the slide change
      moveTreshold = 0.05,
      // in absolute pixels, at which distance the slide stick to the edge on release
      rubberTreshold = 3;

  return {
    restrict: 'A',
    scope: true,
    compile: function(tElement, tAttributes) {
      return function(scope, iElement, iAttributes) {
        var pressed = false,
            startX,
            startY,
            amplitude,
            timestamp,
            offset = 0,
            currentStoryIndex = 0,
            morselHeight,
            storiesCount = 3,
            destination,
            transformProperty = 'transform',
            swipeMoved = false,
            swipeDirection = false,
            winEl = angular.element($window);

        iAttributes.$observe('storySwipe', function(newValue, oldValue) {
          // only bind swipe when it's not switched off
          if(newValue !== 'false' && newValue !== 'off') {
            updateMorselHeight();
            scope.immersiveHeight = morselHeight+'px';

            $swipe.bind(iElement, {
              start: swipeStart,
              move: swipeMove,
              end: swipeEnd,
              cancel: function(event) {
                swipeEnd({}, event);
              }
            });
          } else {
            // unbind swipe when it's switched off
            iElement.unbind();
          }
        });

        // handle orientation change
        winEl.bind('orientationchange', onOrientationChange);
        winEl.bind('resize', onOrientationChange);

        scope.$on('$destroy', function() {
          $document.unbind('mouseup', documentMouseUpEvent);
          winEl.unbind('orientationchange', onOrientationChange);
          winEl.unbind('resize', onOrientationChange);
        });

        //our swiping functions
        function swipeStart(coords, event) {
          $document.bind('mouseup', documentMouseUpEvent);
          pressed = true;
          startX = coords.x;
          startY = coords.y;

          amplitude = 0;
          timestamp = Date.now();

          event.preventDefault();
          event.stopPropagation();

          //call our immersive function
          scope.swipeStarted(coords);

          return false;
        }

        function swipeMove(coords, event) {
          var x,
              y,
              swipeXDelta,
              swipeYDelta;

          if (pressed) {
            x = coords.x;
            swipeXDelta = startX - x;

            y = coords.y;
            swipeYDelta = startY - y;

            //check direction of swipe
            if(Math.abs(swipeXDelta) > Math.abs(swipeYDelta)) {
              //swipe was in the x direction
              //if the swipe just begun, set direction
              if(!swipeDirection) {
                swipeDirection = 'x';
              }
              
              //if we're swiping in x
              if(swipeDirection === 'x') {
                //call our immersive function
                scope.swipeMoved(coords);
              }
            } else {
              //swipe was in the y direction
              //if the swipe just begun, set direction
              if(!swipeDirection) {
                swipeDirection = 'y';
              }

              //if we're swiping in y
              if(swipeDirection === 'y') {
                if (swipeYDelta > 2 || swipeYDelta < -2) {
                  swipeMoved = true;
                  startY = y;
                  requestAnimationFrame(function() {
                    scroll(capPosition(offset + swipeYDelta));
                  });
                }
              }
            }
          }
          event.preventDefault();
          event.stopPropagation();

          return false;
        }

        function swipeEnd(coords, event, forceAnimation) {
          var currentOffset,
              absMove,
              storiesMove,
              shouldMove,
              moveOffset;

          // Prevent clicks on buttons inside slider to trigger "swipeEnd" event on touchend/mouseup
          if(event && !swipeMoved) {
            return;
          }

          $document.unbind('mouseup', documentMouseUpEvent);

          swipeDirection = false;
          pressed = false;
          swipeMoved = false;
          destination = offset;
          currentOffset = (currentStoryIndex * morselHeight);
          absMove = currentOffset - destination;
          storiesMove = -Math[absMove>=0?'ceil':'floor'](absMove / morselHeight);
          shouldMove = Math.abs(absMove) > getAbsMoveTreshold();

          if ((storiesMove + currentStoryIndex) >= storiesCount ) {
            storiesMove = storiesCount - 1 - currentStoryIndex;
          }
          if ((storiesMove + currentStoryIndex) < 0) {
            storiesMove = -currentStoryIndex;
          }
          
          moveOffset = shouldMove ? storiesMove : 0;

          destination = (moveOffset + currentStoryIndex) * morselHeight;
          amplitude = destination - offset;
          timestamp = Date.now();
          if (forceAnimation) {
            amplitude = offset - currentOffset;
          }
          requestAnimationFrame(autoScroll);

          if (event) {
            event.preventDefault();
            event.stopPropagation();
          }

          //call our immersive function
          scope.swipeEnded(coords, forceAnimation);
          return false;
        }

        //helpers
        function capPosition(position) {
          // limit position if start or end of slides
          if (currentStoryIndex===0) {
            position = Math.max(-getAbsMoveTreshold(), position);
          } else if (currentStoryIndex===storiesCount-1) {
            position = Math.min(((storiesCount-1)*morselHeight + getAbsMoveTreshold()), position);
          }
          return position;
        }

        function capIndex(idx) {
          // ensure given index it inside bounds
          return (idx >= storiesCount) ? storiesCount: (idx <= 0) ? 0 : idx;
        }

        function getAbsMoveTreshold() {
          // return min pixels required to move a slide
          return moveTreshold * morselHeight;
        }

        function updateMorselHeight() {
          morselHeight = window.innerHeight;
        }

        //scrolling
        function scroll(x) {
          // use CSS 3D transform to move the screen
          if (isNaN(x)) {
            x = currentStoryIndex * morselHeight;
          }

          offset = x;
          var move = -Math.round(offset);
          iElement.find('ul')[0].style[transformProperty] = 'translate3d(0, ' + move + 'px, 0)';
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
              goToSlide(destination / morselHeight);
            }
          }
        }

        function goToSlide(i, animate) {
          if (isNaN(i)) {
            i = currentStoryIndex;
          }
          if (animate) {
            // simulate a swipe so we have the standard animation
            // used when external binding index is updated or touch canceed
            offset = (i * morselHeight);
            swipeEnd(null, null, true);
            return;
          }
          currentStoryIndex = capIndex(i);
          // if outside of angular scope, trigger angular digest cycle
          // use local digest only for perfs if no index bound
          if (scope.$$phase!=='$apply' && scope.$$phase!=='$digest') {
            scope.$digest();
          }
          scroll();
        }

        function documentMouseUpEvent(event) {
          // in case we click outside the carousel, trigger a fake swipeEnd
          swipeMoved = true;
          swipeEnd({
            x: event.clientX,
            y: event.clientY
          }, event);
        }

        // detect supported CSS property
        ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
          var e = prefix + 'Transform';
          if (typeof document.body.style[e] !== 'undefined') {
            transformProperty = e;
            return false;
          }
          return true;
        });

        function onOrientationChange() {
          goToSlide();
        }
      };
    }
  };
}]);