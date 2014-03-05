/*
 * Adapted from: http://github.com/revolunet/angular-carousel
*/

angular.module('Morsel.morselSwipe', [
  'ngTouch'
])

.directive('morselControls', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
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
                '<span class="morsel-control morsel-control-prev" ng-click="prev()" ng-if="index > 0"></span>' +
                '<span class="morsel-control morsel-control-next" ng-click="next()" ng-if="index < items.length - 1"></span>' +
              '</div>'
  };
}])

.directive('morselIndicators', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
      index: '=',
      disabled: '=indicatorsDisabled'
    },
    template: '<div ng-class="{\'morsel-indicators\' : true, disabled : disabled}">' +
                '<span ng-repeat="item in items" ng-click="$parent.index=$index" ng-class="{active: $index==$parent.index}"></span>' +
              '</div>'
  };
}])

.directive('morselPostedAt', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      timeAgo: '='
    },
    template: '<p am-time-ago="timeAgo" class="time-ago"></p>'
  };
}])

.directive('morselSwipe', ['$swipe', '$window', '$document', '$parse', '$compile', function($swipe, $window, $document, $parse, $compile) {
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
      // use the compile phase to customize the DOM
      var morsels = tElement.find('morsels'),
          slidesCount = 0,
          swipeMoved = false,
          isIndexBound = false,
          // add a wrapper div that will hide the overflow
          carousel = morsels.wrap('<div class="morsels-container" />'),
          container = carousel.parent();

      return function(scope, iElement, iAttributes, containerCtrl) {

        var containerWidth,
            transformProperty,
            pressed,
            startX,
            amplitude,
            offset = 0,
            destination,
            slidesCount = 0,
            // javascript based animation easing
            timestamp,
            thisMorselSwipeNum,
            morselsModel;

        //make sure we create a new object to store data for this swipe
        thisMorselSwipeNum = scope.morselSwipes.length;
        scope.morselSwipes[thisMorselSwipeNum] = {};

        //see if this is even swipeable
        iAttributes.$observe('morselSwipe', function(newValue, oldValue) {
          // only bind swipe when it's not switched off
          if(newValue !== 'false' && newValue !== 'off') {
            $swipe.bind(carousel, {
              start: swipeStart,
              move: swipeMove,
              end: swipeEnd,
              cancel: function(event) {
                swipeEnd({}, event);
              }
            });

            //enable indicators
            scope.morselSwipes[thisMorselSwipeNum].indicatorsDisabled = false;

            // if indicator or controls, setup the watch
            updateIndicatorArray();
            scope.$watch('morselSwipes['+thisMorselSwipeNum+'].carouselIndex', function(newValue) {
              scope.morselSwipes[thisMorselSwipeNum].indicatorIndex = newValue;
            });
            scope.$watch('morselSwipes['+thisMorselSwipeNum+'].indicatorIndex', function(newValue) {
              goToSlide(newValue, true);
            });

            // enable two sets of carousel indicators
            var indicatorTop = $compile('<div index="morselSwipes['+thisMorselSwipeNum+'].indicatorIndex" items="morselSwipes['+thisMorselSwipeNum+'].carouselIndicatorArray" indicators-disabled="morselSwipes['+thisMorselSwipeNum+'].indicatorsDisabled" morsel-indicators></div>')(scope);
            iElement.find('morselIndicatorTop').replaceWith(indicatorTop);

            var indicatorBottom = $compile('<div index="morselSwipes['+thisMorselSwipeNum+'].indicatorIndex" items="morselSwipes['+thisMorselSwipeNum+'].carouselIndicatorArray" indicators-disabled="morselSwipes['+thisMorselSwipeNum+'].indicatorsDisabled" morsel-indicators></div>')(scope);
            iElement.find('morselIndicatorBottom').replaceWith(indicatorBottom);

            var controls = $compile('<div index="morselSwipes['+thisMorselSwipeNum+'].indicatorIndex" items="morselSwipes['+thisMorselSwipeNum+'].carouselIndicatorArray" morsel-controls></div>')(scope);
            iElement.find('morselControls').append(controls);
          } else {
            //disable indicators
            scope.morselSwipes[thisMorselSwipeNum].indicatorsDisabled = true;

            // unbind swipe when it's switched off
            carousel.unbind();
          }
        });

        //set up the corrensponding morsel model
        iAttributes.$observe('morselSwipeMorsels', function(newValue, oldValue) {
          morselsModel = newValue;

          // enable created at stamp
          var createdAt = $compile('<div time-ago="'+morselsModel+'[morselSwipes['+thisMorselSwipeNum+'].indicatorIndex].created_at" morsel-posted-at></div>')(scope);
          iElement.find('morselPostedAt').replaceWith(createdAt);

          // watch the given collection
          scope.$watchCollection(morselsModel, function(newValue, oldValue) {
            slidesCount = 0;
            if (angular.isArray(newValue)) {
              slidesCount = newValue.length;
            } else if (angular.isObject(newValue)) {
              slidesCount = Object.keys(newValue).length;
            }
            updateIndicatorArray();
            if (!containerWidth) {
              updateContainerWidth();
            }
            goToSlide(scope.morselSwipes[thisMorselSwipeNum].carouselIndex);
            });
        });

        scope.morselSwipes[thisMorselSwipeNum].carouselIndex = 0;

        // handle index databinding
        iAttributes.$observe('morselSwipeIndex', function(newValue, oldValue) {
          if(!isNaN(newValue)) {
            //carousel starts at 0
            scope.morselSwipes[thisMorselSwipeNum].carouselIndex = newValue - 1;
          }
        });

        function updateIndicatorArray() {
          // generate an array to be used by the indicators
          var items = [];
          for (var i = 0; i < slidesCount; i++) {
            items[i] = i;
          }
          scope.morselSwipes[thisMorselSwipeNum].carouselIndicatorArray = items;
        }

        function getCarouselWidth() {
         // container.css('width', 'auto');
          var slides = carousel.children();
          if (slides.length === 0) {
            containerWidth = carousel[0].getBoundingClientRect().width;
          } else {
            containerWidth = slides[0].getBoundingClientRect().width;
          }
          // console.log('getCarouselWidth', containerWidth);
          return Math.floor(containerWidth);
        }

        function updateContainerWidth() {
          // force the carousel container width to match the first slide width
          container.css('width', '100%');
          container.css('width', getCarouselWidth() + 'px');
        }

        function scroll(x) {
          // use CSS 3D transform to move the carousel
          //console.log('scroll', x, 'index', scope.morselSwipes[thisMorselSwipeNum].carouselIndex);
          if (isNaN(x)) {
            x = scope.morselSwipes[thisMorselSwipeNum].carouselIndex * containerWidth;
          }

          offset = x;
          var move = -Math.round(offset);
          carousel.find('ul')[0].style[transformProperty] = 'translate3d(' + move + 'px, 0, 0)';
        }

        function autoScroll() {
          // scroll smoothly to "destination" until we reach it
          // using requestAnimationFrame
          var elapsed, delta;

          if (amplitude) {
            elapsed = Date.now() - timestamp;
            delta = amplitude * Math.exp(-elapsed / timeConstant);
            if (delta > rubberTreshold || delta < -rubberTreshold) {
              scroll(destination - delta);
              requestAnimationFrame(autoScroll);
            } else {
              goToSlide(destination / containerWidth);
            }
          }
        }

        function capIndex(idx) {
          // ensure given index it inside bounds
          return (idx >= slidesCount) ? slidesCount: (idx <= 0) ? 0 : idx;
        }

        function goToSlide(i, animate) {
          if (isNaN(i)) {
            i = scope.morselSwipes[thisMorselSwipeNum].carouselIndex;
          }
          if (animate) {
            // simulate a swipe so we have the standard animation
            // used when external binding index is updated or touch canceed
            offset = (i * containerWidth);
            swipeEnd(null, null, true);
            return;
          }
          scope.morselSwipes[thisMorselSwipeNum].carouselIndex = capIndex(i);
          // if outside of angular scope, trigger angular digest cycle
          // use local digest only for perfs if no index bound
          if (scope.$$phase!=='$apply' && scope.$$phase!=='$digest') {
            if (isIndexBound) {
              scope.$apply();
            } else {
              scope.$digest();
            }
          }
          scroll();
        }

        function getAbsMoveTreshold() {
          // return min pixels required to move a slide
          return moveTreshold * containerWidth;
        }

        function documentMouseUpEvent(event) {
          // in case we click outside the carousel, trigger a fake swipeEnd
          swipeMoved = true;
          swipeEnd({
            x: event.clientX,
            y: event.clientY
          }, event);
        }

        function capPosition(x) {
          // limit position if start or end of slides
          var position = x;
          if (scope.morselSwipes[thisMorselSwipeNum].carouselIndex===0) {
            position = Math.max(-getAbsMoveTreshold(), position);
          } else if (scope.morselSwipes[thisMorselSwipeNum].carouselIndex===slidesCount-1) {
            position = Math.min(((slidesCount-1)*containerWidth + getAbsMoveTreshold()), position);
          }
          return position;
        }

        function swipeStart(coords, event) {
          var tagCheck = event.target.tagName.toUpperCase();

          if(tagCheck === 'INPUT' || tagCheck === 'TEXTAREA') {
            return false;
          } else {
            //console.log('swipeStart', coords, event);
            $document.bind('mouseup', documentMouseUpEvent);
            pressed = true;
            startX = coords.x;

            amplitude = 0;
            timestamp = Date.now();

            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }

        function swipeMove(coords, event) {
          //console.log('swipeMove', coords, event);
          var x, delta;
          if (pressed) {
            x = coords.x;
            delta = startX - x;
            if (delta > 2 || delta < -2) {
              swipeMoved = true;
              startX = x;
              requestAnimationFrame(function() {
                scroll(capPosition(offset + delta));
              });
            }
          }
          event.preventDefault();
          event.stopPropagation();
          return false;
        }

        function swipeEnd(coords, event, forceAnimation) {
          var newMorselNum;

          // Prevent clicks on buttons inside slider to trigger "swipeEnd" event on touchend/mouseup
          if(event && !swipeMoved) {
            return;
          }

          //console.log('swipeEnd', 'scope.morselSwipes[thisMorselSwipeNum].carouselIndex', scope.morselSwipes[thisMorselSwipeNum].carouselIndex);
          $document.unbind('mouseup', documentMouseUpEvent);
          pressed = false;
          swipeMoved = false;

          destination = offset;

          var minMove = getAbsMoveTreshold(),
              currentOffset = (scope.morselSwipes[thisMorselSwipeNum].carouselIndex * containerWidth),
              absMove = currentOffset - destination,
              slidesMove = -Math[absMove>=0?'ceil':'floor'](absMove / containerWidth),
              shouldMove = Math.abs(absMove) > minMove;

          if ((slidesMove + scope.morselSwipes[thisMorselSwipeNum].carouselIndex) >= slidesCount ) {
            slidesMove = slidesCount - 1 - scope.morselSwipes[thisMorselSwipeNum].carouselIndex;
          }
          if ((slidesMove + scope.morselSwipes[thisMorselSwipeNum].carouselIndex) < 0) {
            slidesMove = -scope.morselSwipes[thisMorselSwipeNum].carouselIndex;
          }
          var moveOffset = shouldMove?slidesMove:0;

          destination = (moveOffset + scope.morselSwipes[thisMorselSwipeNum].carouselIndex) * containerWidth;
          amplitude = destination - offset;
          timestamp = Date.now();
          if (forceAnimation) {
            amplitude = offset - currentOffset;
          }
          requestAnimationFrame(autoScroll);

          //we swiped to a new morsel, we should do some stuff
          if(shouldMove && moveOffset) {
            newMorselNum = scope.morselSwipes[thisMorselSwipeNum].carouselIndex + moveOffset;

            //propagate up to parents in case they're looking
            if(scope.swipeEvents) {
              scope.swipeEvents.needsComments = newMorselNum;
            }
          }

          if (event) {
            event.preventDefault();
            event.stopPropagation();
          }
          return false;
        }

        // initialise first slide only if no binding
        // if so, the binding will trigger the first init
        if (!isIndexBound) {
          goToSlide(scope.morselSwipes[thisMorselSwipeNum].carouselIndex);
        }

        // detect supported CSS property
        transformProperty = 'transform';
        ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
          var e = prefix + 'Transform';
          if (typeof document.body.style[e] !== 'undefined') {
            transformProperty = e;
            return false;
          }
          return true;
        });

        function onOrientationChange() {
          updateContainerWidth();
          goToSlide();
        }

        // handle orientation change
        var winEl = angular.element($window);
        winEl.bind('orientationchange', onOrientationChange);
        winEl.bind('resize', onOrientationChange);

        scope.$on('$destroy', function() {
          $document.unbind('mouseup', documentMouseUpEvent);
          winEl.unbind('orientationchange', onOrientationChange);
          winEl.unbind('resize', onOrientationChange);
        });
      };
    }
  };
}]);