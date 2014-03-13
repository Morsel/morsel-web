/*
 * Adapted from: http://github.com/revolunet/angular-carousel
*/

angular.module('Morsel.immersiveSwipe', [
  'ngTouch'
])

.directive('immersiveControls', [function() {
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
                '<span class="immersive-control immersive-control-prev" ng-click="prev()" ng-if="index > 0"></span>' +
                '<span class="immersive-control immersive-control-next" ng-click="next()" ng-if="index < count - 1"></span>' +
              '</div>'
  };
}])

.directive('immersiveSwipe', ['$window', function($window) {
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
            immersiveWidth,
            destination,
            transformProperty = 'transform',
            swipeXMoved = false,
            winEl = angular.element($window);

        updateImmersiveWidth();

        //our scope vars, accessible by indicators
        scope.currentStoryIndex = 0; //track which morsel we're on
        scope.currentControlIndex = 0; //track which indicator is active
        scope.storiesCount = 3;

        //set up our scope watches
        //watch our stories
        scope.$watchCollection('stories', function(newValue, oldValue) {
          scope.storiesCount = 0;
          if (angular.isArray(newValue)) {
            scope.storiesCount = newValue.length;
          } else if (angular.isObject(newValue)) {
            scope.storiesCount = Object.keys(newValue).length;
          }
          
          goToSlide(scope.currentStoryIndex);
        });

        //watch for changes from the controls
        scope.$watch('currentControlIndex', function(newValue) {
          goToSlide(newValue, true);
        });

        //make sure our control index is updated when we change stories
        scope.$watch('currentStoryIndex', function(newValue) {
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
              storiesMove,
              shouldMove,
              moveOffset;

          /*if(!pressed) {
            pressed = false;
            return;
          }*/

          pressed = false;
          swipeXMoved = false;
          destination = offset;
          currentOffset = (scope.currentStoryIndex * immersiveWidth);
          absMove = currentOffset - destination;
          storiesMove = -Math[absMove>=0?'ceil':'floor'](absMove / immersiveWidth);
          shouldMove = Math.abs(absMove) > getAbsMoveTreshold();

          if ((storiesMove + scope.currentStoryIndex) >= scope.storiesCount ) {
            storiesMove = scope.storiesCount - 1 - scope.currentStoryIndex;
          }
          if ((storiesMove + scope.currentStoryIndex) < 0) {
            storiesMove = -scope.currentStoryIndex;
          }
          
          moveOffset = shouldMove ? storiesMove : 0;

          destination = (moveOffset + scope.currentStoryIndex) * immersiveWidth;
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
          if (scope.currentStoryIndex===0) {
            position = Math.max(-getAbsMoveTreshold(), position);
          } else if (scope.currentStoryIndex===scope.storiesCount-1) {
            position = Math.min(((scope.storiesCount-1)*immersiveWidth + getAbsMoveTreshold()), position);
          }
          return position;
        }

        function capIndex(idx) {
          // ensure given index it inside bounds
          return (idx >= scope.storiesCount) ? scope.storiesCount: (idx <= 0) ? 0 : idx;
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
            x = scope.currentStoryIndex * immersiveWidth;
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
            i = scope.currentStoryIndex;
          }
          if (animate) {
            // simulate a swipe so we have the standard animation
            // used when external binding index is updated or touch canceed
            offset = (i * immersiveWidth);
            scope.swipeEnded(null, true);
            return;
          }
          scope.currentStoryIndex = capIndex(i);
          // if outside of angular scope, trigger angular digest cycle
          // use local digest only for perfs if no index bound
          if (scope.$$phase!=='$apply' && scope.$$phase!=='$digest') {
            scope.$digest();
          }
          scroll();
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