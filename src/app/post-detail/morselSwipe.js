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
    template: '<p am-time-ago="timeAgo"></p>'
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
      var morsels = angular.element(document.querySelector('[morsels]')),
          morselLi = morsels.children()[0],
          slidesCount = 0,
          isIndexBound = false,
          repeatCollection = 'post.morsels';

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
            timestamp;

        // add a wrapper div that will hide the overflow
        var carousel = morsels.wrap('<div class="morsels-container"></div>'),
            container = carousel.parent();

        // if indicator or controls, setup the watch

        updateIndicatorArray();
        scope.$watch('carouselIndex', function(newValue) {
          scope.indicatorIndex = newValue;
        });
        scope.$watch('indicatorIndex', function(newValue) {
          goToSlide(newValue, true);
        });

        // enable two sets of carousel indicators
        var indicatorTop = $compile('<div index="indicatorIndex" items="carouselIndicatorArray" indicators-disabled="indicatorsDisabled" morsel-indicators></div>')(scope);
        iElement.find('morselIndicatorTop').replaceWith(indicatorTop);

        var indicatorBottom = $compile('<div index="indicatorIndex" items="carouselIndicatorArray" indicators-disabled="indicatorsDisabled" morsel-indicators></div>')(scope);
        iElement.find('morselIndicatorBottom').replaceWith(indicatorBottom);

        var controls = $compile('<div index="indicatorIndex" items="carouselIndicatorArray" morsel-controls></div>')(scope);
        iElement.find('morselControls').append(controls);

        // enable created at stamp
        var createdAt = $compile('<div time-ago="morselsData[indicatorIndex].created_at" morsel-posted-at></div>')(scope);
        iElement.find('morselPostedAt').replaceWith(createdAt);

        scope.carouselIndex = 0;

        // handle index databinding
        //if (iAttributes.morselSwipeIndex) {
        iAttributes.$observe('morselSwipeIndex', function(newValue, oldValue) {
          if(!isNaN(newValue)) {
            //carousel starts at 0
            scope.carouselIndex = newValue - 1;
          }
        });

        // watch the given collection
        scope.$watchCollection(repeatCollection, function(newValue, oldValue) {
          //store our morsel data in scope so we can display it elsewhere in the view
          scope.morselsData = newValue;
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
          goToSlide(scope.carouselIndex);
        });

        function updateIndicatorArray() {
          // generate an array to be used by the indicators
          var items = [];
          for (var i = 0; i < slidesCount; i++) {
            items[i] = i;
          }
          scope.carouselIndicatorArray = items;
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
          //console.log('scroll', x, 'index', scope.carouselIndex);
          if (isNaN(x)) {
            x = scope.carouselIndex * containerWidth;
          }

          offset = x;
          var move = -Math.round(offset);
          carousel[0].style[transformProperty] = 'translate3d(' + move + 'px, 0, 0)';
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
            i = scope.carouselIndex;
          }
          if (animate) {
            // simulate a swipe so we have the standard animation
            // used when external binding index is updated or touch canceed
            offset = (i * containerWidth);
            swipeEnd(null, null, true);
            return;
          }
          scope.carouselIndex = capIndex(i);
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
          swipeEnd({
            x: event.clientX,
            y: event.clientY
          }, event);
        }

        function capPosition(x) {
          // limit position if start or end of slides
          var position = x;
          if (scope.carouselIndex===0) {
            position = Math.max(-getAbsMoveTreshold(), position);
          } else if (scope.carouselIndex===slidesCount-1) {
            position = Math.min(((slidesCount-1)*containerWidth + getAbsMoveTreshold()), position);
          }
          return position;
        }

        function swipeStart(coords, event) {
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

        function swipeMove(coords, event) {
          //console.log('swipeMove', coords, event);
          var x, delta;
          if (pressed) {
            x = coords.x;
            delta = startX - x;
            if (delta > 2 || delta < -2) {
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
          //console.log('swipeEnd', 'scope.carouselIndex', scope.carouselIndex);
          $document.unbind('mouseup', documentMouseUpEvent);
          pressed = false;

          destination = offset;

          var minMove = getAbsMoveTreshold(),
              currentOffset = (scope.carouselIndex * containerWidth),
              absMove = currentOffset - destination,
              slidesMove = -Math[absMove>=0?'ceil':'floor'](absMove / containerWidth),
              shouldMove = Math.abs(absMove) > minMove;

          if ((slidesMove + scope.carouselIndex) >= slidesCount ) {
            slidesMove = slidesCount - 1 - scope.carouselIndex;
          }
          if ((slidesMove + scope.carouselIndex) < 0) {
            slidesMove = -scope.carouselIndex;
          }
          var moveOffset = shouldMove?slidesMove:0;

          destination = (moveOffset + scope.carouselIndex) * containerWidth;
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
            scope.indicatorsDisabled = false;
          } else {
            //disable indicators
            scope.indicatorsDisabled = true;

            // unbind swipe when it's switched off
            carousel.unbind();
          }
        });

        // initialise first slide only if no binding
        // if so, the binding will trigger the first init
        if (!isIndexBound) {
          goToSlide(scope.carouselIndex);
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