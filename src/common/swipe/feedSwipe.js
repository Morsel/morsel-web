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

.directive('feedSwipe', ['$window', function($window) {
  var // used to compute the sliding speed
      timeConstant = 75,
      // in container % how much we need to drag to trigger the slide change
      moveTreshold = 0.05,
      // in absolute pixels, at which distance the slide stick to the edge on release
      rubberTreshold = 3,
      //max time between scrolls
      scrollThreshold = 500;

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
            feedWidth,
            destination,
            transformProperty = 'transform',
            swipeXMoved = false,
            winEl = angular.element($window),
            lastScrollTimestamp;

        updatefeedWidth();

        //our scope vars, accessible by indicators
        scope.currentMorselIndex = 0; //track which morsel we're on
        scope.currentControlIndex = 0; //track which indicator is active
        scope.morselsCount = 0;

        //scope vars for individual morsels
        scope.feedState = {
          inMorsel : false,
          onShare : false
        };

        scope.updatefeedState = function(obj) {
          _.extend(scope.feedState, obj);
          scope.$digest();
        };

        //set up our scope watches
        //watch our morsels
        scope.$watchCollection('morsels', function(newValue, oldValue) {
          scope.morselsCount = 0;
          if (angular.isArray(newValue)) {
            scope.morselsCount = newValue.length;
          } else if (angular.isObject(newValue)) {
            scope.morselsCount = Object.keys(newValue).length;
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
              goToSlide(destination / feedWidth);
            }
          }
        }

        function goToSlide(i, animate) {
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