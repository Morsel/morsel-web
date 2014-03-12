angular.module('Morsel.immersiveSwipe', [
  'ngTouch'
])

.directive('immersiveSwipe', ['swipe', '$window', '$document', '$parse', '$compile', function($swipe, $window, $document, $parse, $compile) {
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
            amplitude,
            timestamp,
            offset = 0,
            currentStoryIndex = 0,
            immersiveWidth,
            storiesCount = 3,
            destination,
            transformProperty = 'transform',
            swipeMoved = false,
            winEl = angular.element($window);

        iAttributes.$observe('immersiveSwipe', function(newValue, oldValue) {
          // only bind swipe when it's not switched off
          if(newValue !== 'false' && newValue !== 'off') {
            updateImmersiveWidth();

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

          amplitude = 0;
          timestamp = Date.now();

          event.preventDefault();
          event.stopPropagation();
          return false;
        }

        function swipeMove(coords, event) {
          var x,
              swipeDelta;

          if (pressed) {
            x = coords.x;
            swipeDelta = startX - x;
            if (swipeDelta > 2 || swipeDelta < -2) {
              swipeMoved = true;
              startX = x;
              requestAnimationFrame(function() {
                scroll(capPosition(offset + swipeDelta));
              });
            }
          }
          event.preventDefault();
          event.stopPropagation();
          return false;
        }

        function swipeEnd(coords, event, forceAnimation) {
          var newMorselNum,
              currentOffset,
              absMove,
              storiesMove,
              shouldMove,
              moveOffset;

          // Prevent clicks on buttons inside slider to trigger "swipeEnd" event on touchend/mouseup
          if(event && !swipeMoved) {
            return;
          }

          $document.unbind('mouseup', documentMouseUpEvent);
          pressed = false;
          swipeMoved = false;
          destination = offset;
          currentOffset = (currentStoryIndex * immersiveWidth);
          absMove = currentOffset - destination;
          storiesMove = -Math[absMove>=0?'ceil':'floor'](absMove / immersiveWidth);
          shouldMove = Math.abs(absMove) > getAbsMoveTreshold();

          if ((storiesMove + currentStoryIndex) >= storiesCount ) {
            storiesMove = storiesCount - 1 - currentStoryIndex;
          }
          if ((storiesMove + currentStoryIndex) < 0) {
            storiesMove = -currentStoryIndex;
          }
          
          moveOffset = shouldMove ? storiesMove : 0;

          destination = (moveOffset + currentStoryIndex) * immersiveWidth;
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
          return false;
        }

        //helpers
        function capPosition(position) {
          // limit position if start or end of slides
          if (currentStoryIndex===0) {
            position = Math.max(-getAbsMoveTreshold(), position);
          } else if (currentStoryIndex===storiesCount-1) {
            position = Math.min(((storiesCount-1)*immersiveWidth + getAbsMoveTreshold()), position);
          }
          return position;
        }

        function capIndex(idx) {
          // ensure given index it inside bounds
          return (idx >= storiesCount) ? storiesCount: (idx <= 0) ? 0 : idx;
        }

        function getAbsMoveTreshold() {
          // return min pixels required to move a slide
          return moveTreshold * immersiveWidth;
        }

        function updateImmersiveWidth() {
          immersiveWidth = window.innerWidth;
        }

        //scrolling
        function scroll(x) {
          // use CSS 3D transform to move the screen
          if (isNaN(x)) {
            x = currentStoryIndex * immersiveWidth;
          }

          offset = x;
          var move = -Math.round(offset);
          iElement.find('ul')[0].style[transformProperty] = 'translate3d(' + move + 'px, 0, 0)';
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
              goToSlide(destination / immersiveWidth);
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
            offset = (i * immersiveWidth);
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
          //updateContainerWidth();
          goToSlide();
        }
      };
    }
  };
}]);