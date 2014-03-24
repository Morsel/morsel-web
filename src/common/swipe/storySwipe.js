/*
 * Based off: http://github.com/revolunet/angular-carousel
*/

angular.module('Morsel.storySwipe', [
  'ngTouch'
])

.directive('storyThumbnails', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      index: '=',
      morsels: '='
    },
    link: function(scope, element, attrs) {
      scope.range = function(n) {
        return new Array(n);
      };
    },
    templateUrl: 'swipe/storyThumbnails.tpl.html'
  };
}])

.directive('storyIndicators', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      count: '=',
      index: '='
    },
    link: function(scope, element, attrs) {
      scope.range = function(n) {
        return new Array(n);
      };
    },
    template: '<div class="story-indicators">' +
                '<span ng-repeat="c in range(count) track by $index" ng-class="{active: $index==$parent.index}" ng-click="$parent.index=$index"></span>' +
              '</div>'
  };
}])

.directive('storySwipe', ['swipe', '$window', '$document', '$parse', '$compile', function($swipe, $window, $document, $parse, $compile) {
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
            startY,
            amplitude,
            timestamp,
            lastScrollTimestamp,
            offset = 0,
            morselHeight,
            destination,
            transformProperty = 'transform',
            swipeMoved = false,
            swipeDirection = false,
            winEl = angular.element($window),
            handleMouseWheel,
            hamster;

        //our scope vars, accessible by indicators
        scope.currentMorselIndex = 0; //track which morsel we're on
        scope.currentIndicatorIndex = 0; //track which indicator is active
        scope.morselsCount = 1; //account for cover page

        iAttributes.$observe('storySwipe', function(newValue, oldValue) {
          updateMorselHeight();

          // only bind swipe when it's not switched off
          if(newValue !== 'false') {
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

        //watch for update in morsel number
        iAttributes.$observe('storySwipeCount', function(newValue) {
          if(newValue) {
            scope.morselsCount = parseInt(newValue, 10) + 1; //+1 for cover page
          }
        });

        //watch for changes in the indicators
        scope.$watch('currentIndicatorIndex', function(newValue) {
          goToSlide(newValue, true);
        });

        //make sure our indicator index is updated when we change morsels
        scope.$watch('currentMorselIndex', function(newValue) {
          scope.currentIndicatorIndex = newValue;
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
          var elementScope = angular.element(event.target).scope(),
              nonSwipeable = elementScope.nonSwipeable;

          if(!nonSwipeable) {
            $document.bind('mouseup', documentMouseUpEvent);
            pressed = true;
            startX = coords.x;
            startY = coords.y;

            amplitude = 0;
            timestamp = Date.now();

            event.preventDefault();
            event.stopPropagation();

            //call our immersive function
            if(scope.swipeStarted) {
              scope.swipeStarted(coords);
            }

            return false;
          }
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
                if(scope.swipeMoved) {
                  scope.swipeMoved(coords);
                }
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
              morselsMove,
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
          currentOffset = (scope.currentMorselIndex * morselHeight);
          absMove = currentOffset - destination;
          morselsMove = -Math[absMove>=0?'ceil':'floor'](absMove / morselHeight);
          shouldMove = Math.abs(absMove) > getAbsMoveTreshold();

          if ((morselsMove + scope.currentMorselIndex) >= scope.morselsCount ) {
            morselsMove = scope.morselsCount - 1 - scope.currentMorselIndex;
          }
          if ((morselsMove + scope.currentMorselIndex) < 0) {
            morselsMove = -scope.currentMorselIndex;
          }
          
          moveOffset = shouldMove ? morselsMove : 0;

          destination = (moveOffset + scope.currentMorselIndex) * morselHeight;
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
          if(scope.swipeEnded) {
            scope.swipeEnded(coords, forceAnimation);
          }
          return false;
        }

        //helpers
        function capPosition(position) {
          // limit position if start or end of slides
          if (scope.currentMorselIndex===0) {
            position = Math.max(-getAbsMoveTreshold(), position);
          } else if (scope.currentMorselIndex===scope.morselsCount-1) {
            position = Math.min(((scope.morselsCount-1)*morselHeight + getAbsMoveTreshold()), position);
          }
          return position;
        }

        function capIndex(idx) {
          // ensure given index it inside bounds
          return (idx >= scope.morselsCount) ? scope.morselsCount: (idx <= 0) ? 0 : idx;
        }

        function getAbsMoveTreshold() {
          // return min pixels required to move a slide
          return moveTreshold * morselHeight;
        }

        function updateMorselHeight() {
          morselHeight = window.innerHeight;
          scope.immersiveHeight = morselHeight+'px';
        }

        //scrolling
        function scroll(x) {
          var move;

          // use CSS 3D transform to move the screen
          if (isNaN(x)) {
            x = scope.currentMorselIndex * morselHeight;
          }

          offset = x;
          move = -Math.round(offset);

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
            i = scope.currentMorselIndex;
          }
          if (animate) {
            // simulate a swipe so we have the standard animation
            // used when external binding index is updated or touch canceed
            offset = (i * morselHeight);
            swipeEnd(null, null, true);
            return;
          }
          scope.currentMorselIndex = capIndex(i);

          if(scope.updateImmersiveState) {
            scope.updateImmersiveState({
              inStory: scope.currentMorselIndex !== 0
            });
          }

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
          updateMorselHeight();
          goToSlide();
        }

        //deal with mousewheel scrolling
        /*
         * Modified from:
         * angular-mousewheel v1.0.4
         * (c) 2013 Monospaced http://monospaced.com
         * License: MIT
         */
        handleMouseWheel = function(event, delta, deltaX, deltaY){
          var elementScope = angular.element(event.target).scope(),
              nonSwipeable = elementScope.nonSwipeable,
              //use immersive checklastscroll if we can, fall back to story version
              hasScrolled = scope.checkLastScroll ? scope.checkLastScroll() : checkLastScroll();

          //make sure we can scroll on this element and user only scrolls one at a time
          if(!nonSwipeable && hasScrolled) {
            //if we scroll up
            if (deltaY > 0) {
              //if we're on the first morsel
              if (scope.currentMorselIndex === 0) {
                //go to the previous story
                if(scope.goToPrevStory) {
                  scope.goToPrevStory();
                }
              } else {
                //else go to the previous morsel
                goToSlide(scope.currentMorselIndex-1, true);
              }
            } else if (deltaY < 0) {
              //if we scroll down
              //if we're on the last morsel
              if(scope.currentMorselIndex === scope.morselsCount - 1) {
                //go to the next story
                if(scope.goToNextStory) {
                  scope.goToNextStory();
                }
              } else {
                //and aren't on the last morsel
                goToSlide(scope.currentMorselIndex+1, true);
              }
            }
          }
        };

        // don't create multiple Hamster instances per element
        if (!(hamster = iElement.data('hamster'))) {
          hamster = new Hamster(iElement[0]);
          iElement.data('hamster', hamster);
        }

        // bind Hamster wheel event
        hamster.wheel(handleMouseWheel);

        // unbind Hamster wheel event
        scope.$on('$destroy', function(){
          hamster.unwheel(handleMouseWheel);
        });

        //scrolling story fallback
        //keep this here so you don't fire a scroll event in this story (if it's not part of a feed)
        function checkLastScroll() {
          //make sure this scroll should have an effect
          var scrollValid = false;

          if(Date.now() - (lastScrollTimestamp || 0) > scrollThreshold) {
            scrollValid = true;
            lastScrollTimestamp = Date.now();
          }

          return scrollValid;
        }
      };
    }
  };
}]);