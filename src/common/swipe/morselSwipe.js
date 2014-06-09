/*
 * Based off: http://github.com/revolunet/angular-carousel
*/

angular.module('Morsel.common.morselSwipe', [
  'ngTouch'
])

.directive('mrslItemIndicators', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      count: '=mrslCount',
      index: '=mrslIndex'
    },
    link: function(scope, element, attrs) {
      scope.range = function(n) {
        return new Array(n);
      };
    },
    template: '<div class="item-indicators">' +
                '<span ng-repeat="c in range(count) track by $index" ng-class="{active: $index==$parent.index}" ng-click="$parent.index=$index"></span>' +
              '</div>'
  };
})

.directive('mrslMorselSwipe', function(swipe, $window, $document, $parse, $compile, Mixpanel, PhotoHelpers, MORSELPLACEHOLDER, presetMediaQueries) {
  var // used to compute the sliding speed
      timeConstant = 75,
      // in container % how much we need to drag to trigger the slide change
      moveTreshold = 0.05,
      // in absolute pixels, at which distance the slide stick to the edge on release
      rubberTreshold = 3,
      //max time between scrolls
      scrollTimeThreshold = 500,
      //use a debounce function so mousewheel functions don't fire multiple times
      scrollDebounceTime = 40,
      //same as ^ for keys
      keyDebounceTime = 350,
      //min intensity for scrolls
      scrollMinIntensity = 1,
      //number of additional "pages". 1. cover page 2. share page
      extraPages = 2,
      //height of the cover page blocks on the bottome;
      coverPageBlockHeight = 140,
      //height of our header
      headerHeight = 60;

  return {
    restrict: 'A',
    scope: true,
    link: function(scope, iElement, iAttributes) {
      var pressed = false,
          startX,
          startY,
          amplitude,
          timestamp,
          lastScrollTimestamp,
          offset = 0,
          itemHeight,
          destination,
          transformProperty = 'transform',
          swipeMoved = false,
          swipeDirection = false,
          winEl = angular.element($window),
          handleMouseWheel,
          hamster,
          animationFrame = new AnimationFrame(),
          debouncedKeydown;

      //our scope vars, accessible by indicators
      scope.currentItemIndex = 0; //track which item we're on
      scope.currentIndicatorIndex = 0; //track which indicator is active
      scope.itemCount = extraPages; //account for cover page + share page

      scope.getCoverPhotoArray = function(morsel) {
        var primaryItemPhotos;

        if(morsel.items) {
          primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(morsel);

          if(primaryItemPhotos) {
            return [
              ['default', primaryItemPhotos._320x320],
              ['(min-width: 321px)', primaryItemPhotos._480x480],
              ['screen-xs', primaryItemPhotos._640x640]
            ];
          } else {
            var lastItemWithPhotos;

            //loop through items, take the last one with photos
            _.each(morsel.items, function(item) {
              if(item.photos) {
                lastItemWithPhotos = item;
              }
            });

            if(lastItemWithPhotos) {
              return [
                ['default', lastItemWithPhotos.photos._320x320],
                ['(min-width: 321px)', lastItemWithPhotos.photos._480x480],
                ['screen-xs', lastItemWithPhotos.photos._640x640]
              ];
            } else {
              //no items have photos
              return [
                ['default', '/assets/images/logos/morsel-placeholder.jpg']
              ];
            }
            return [
              ['default', MORSELPLACEHOLDER]
            ];
          }
        } else {
          //return blank
          return [];
        }
      };

      scope.getItemPhotoArray = function(item) {
        if(item) {
          if(item.photos) {
            return [
              ['default', item.photos._320x320],
              ['(min-width: 321px)', item.photos._480x480],
              ['screen-xs', item.photos._640x640]
            ];
          } else {
            return [
              ['default', MORSELPLACEHOLDER]
            ];
          }
        } else {
          //return blank
          return [];
        }
      };

      iAttributes.$observe('mrslMorselSwipe', function(newValue, oldValue) {
        updateItemHeight();

        // only bind swipe when it's not switched off
        if(newValue !== 'false') {
          swipe.bind(iElement, {
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

      //watch for update in item number
      iAttributes.$observe('mrslMorselSwipeCount', function(newValue) {
        if(newValue) {
          scope.itemCount = parseInt(newValue, 10) + extraPages; //+2 for cover page + share page
        }
      });

      //watch for changes in the indicators
      scope.$watch('currentIndicatorIndex', function(newValue) {
        //console.log('124 - currentIndicatorIndex watch: '+newValue);
        goToSlide(newValue, true);
      });

      //make sure our indicator index is updated when we change morsels
      scope.$watch('currentItemIndex', function(newValue) {
        //console.log('130 - currentItemIndex watch: '+newValue);
        scope.currentIndicatorIndex = newValue;
      });

      // handle orientation change
      winEl.bind('orientationchange', onOrientationChange);
      winEl.bind('resize', onOrientationChange);

      scope.$on('$destroy', function() {
        $document.unbind('mouseup', documentMouseUpEvent);
        $document.unbind('touchend', documentMouseUpEvent);
        winEl.unbind('orientationchange', onOrientationChange);
        winEl.unbind('resize', onOrientationChange);
      });

      //our swiping functions
      function swipeStart(coords, event) {
        var elementScope = angular.element(event.target).scope(),
            nonSwipeable = elementScope.nonSwipeable;

        if(!nonSwipeable) {
          $document.bind('mouseup', documentMouseUpEvent);
          $document.bind('touchend', documentMouseUpEvent);
          pressed = true;
          startX = coords.x;
          startY = coords.y;

          amplitude = 0;
          timestamp = Date.now();

          event.preventDefault();
          event.stopPropagation();

          //call our feed function
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
              //call our feed function
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
                animationFrame.request(function() {
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
            itemsMove,
            shouldMove,
            moveOffset;

        // Prevent clicks on buttons inside slider to trigger "swipeEnd" event on touchend/mouseup
        if(event && !swipeMoved) {
          return;
        }

        $document.unbind('mouseup', documentMouseUpEvent);
        $document.unbind('touchend', documentMouseUpEvent);

        swipeDirection = false;
        pressed = false;
        swipeMoved = false;
        destination = offset;
        currentOffset = (scope.currentItemIndex * itemHeight);
        absMove = currentOffset - destination;
        itemsMove = -Math[absMove>=0?'ceil':'floor'](absMove / itemHeight);
        shouldMove = Math.abs(absMove) > getAbsMoveTreshold();

        if ((itemsMove + scope.currentItemIndex) >= scope.itemCount ) {
          itemsMove = scope.itemCount - 1 - scope.currentItemIndex;
        }
        if ((itemsMove + scope.currentItemIndex) < 0) {
          itemsMove = -scope.currentItemIndex;
        }
        
        moveOffset = shouldMove ? itemsMove : 0;
        //console.log('257 - moveOffset:',moveOffset,' scope.currentItemIndex:',scope.currentItemIndex,' itemHeight:',itemHeight);
        destination = (moveOffset + scope.currentItemIndex) * itemHeight;
        //console.log('259 destination: ',destination);
        //console.log('260 offset: ',offset);
        amplitude = destination - offset;
        //console.log('262 amplitude: ',amplitude);
        timestamp = Date.now();
        if (forceAnimation) {
          amplitude = offset - currentOffset;
          //console.log('266 amplitude: ',amplitude);
        }
        animationFrame.request(autoScroll);

        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        //call our feed function
        if(scope.swipeEnded) {
          scope.swipeEnded(coords, forceAnimation);
        }
        return false;
      }

      //helpers
      function capPosition(position) {
        // limit position if start or end of slides
        if (scope.currentItemIndex===0) {
          position = Math.max(-getAbsMoveTreshold(), position);
        } else if (scope.currentItemIndex===scope.itemCount-1) {
          position = Math.min(((scope.itemCount-1)*itemHeight + getAbsMoveTreshold()), position);
        }
        return position;
      }

      function capIndex(idx) {
        // ensure given index it inside bounds
        return (idx >= scope.itemCount) ? scope.itemCount: (idx <= 0) ? 0 : idx;
      }

      function getAbsMoveTreshold() {
        // return min pixels required to move a slide
        return moveTreshold * itemHeight;
      }

      function updateItemHeight() {
        itemHeight = window.innerHeight;
        scope.feedHeight = itemHeight+'px';

        if (matchMedia(presetMediaQueries['screen-md']).matches) {
          scope.coverPhotoHeight = (itemHeight - headerHeight) +'px';
          scope.coverBlockMinHeight = (itemHeight - headerHeight)/2 +'px';
        } else {
          scope.coverPhotoHeight = (itemHeight - coverPageBlockHeight - headerHeight) +'px';
          scope.coverBlockMinHeight = '0';
        }
      }

      //scrolling
      function scroll(y) {
        var move;

        // use CSS 3D transform to move the screen
        if (isNaN(y)) {
          y = scope.currentItemIndex * itemHeight;
        }

        offset = y;
        move = -Math.round(offset);

        iElement.find('ul')[0].style[transformProperty] = 'translate3d(0, ' + move + 'px, 0)';
      }

      function autoScroll() {
        // scroll smoothly to "destination" until we reach it
        // using animationFrame API
        var elapsed,
            delta;

        if (amplitude) {
          elapsed = Date.now() - timestamp;
          delta = amplitude * Math.exp(-elapsed / timeConstant);
          if (delta > rubberTreshold || delta < -rubberTreshold) {
            scroll(destination - delta);
            animationFrame.request(autoScroll);
          } else {
            //console.log('332 - before gotoslide - destination: '+destination);
            //console.log('333 - before gotoslide - itemHeight: '+itemHeight);
            goToSlide(destination / itemHeight);
          }
        }
      }

      function goToSlide(i, animate) {
        //console.log('338 - gotoslide start: '+i);
        if (isNaN(i)) {
          i = scope.currentItemIndex;
        }
        //console.log('342 - animate?: '+animate);
        if (animate) {
          // simulate a swipe so we have the standard animation
          // used when external binding index is updated or touch canceed
          offset = (i * itemHeight);
          swipeEnd(null, null, true);
          return;
        }
        //console.log('350 - currentItemIndex set with: '+i);
        scope.currentItemIndex = capIndex(i);

        if(scope.updatefeedState) {
          scope.updatefeedState({
            inMorsel: scope.currentItemIndex > 0 && scope.currentItemIndex < scope.itemCount - 1,
            onShare: scope.currentItemIndex === scope.itemCount - 1
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
        updateItemHeight();
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
            nonScrollable = elementScope.nonScrollable,
            //use feed checklastscroll if we can, fall back to morsel version
            hasScrolled = scope.checkLastScroll ? scope.checkLastScroll() : checkLastScroll();

        //make sure we can scroll on this element and user only scrolls one at a time
        if(!nonScrollable && hasScrolled) {
          //if we scroll up
          if (deltaY > 0 && (Math.abs(deltaY) >= scrollMinIntensity) ) {
            tryGoingUp();
          } else if (deltaY < 0 && (Math.abs(deltaY) >= scrollMinIntensity) ) {
            tryGoingDown();
          }
        }
      };

      // don't create multiple Hamster instances per element
      if (!(hamster = iElement.data('hamster'))) {
        hamster = new Hamster(iElement[0]);
        iElement.data('hamster', hamster);
      }

      // bind Hamster wheel event
      hamster.wheel(_.debounce(handleMouseWheel, scrollDebounceTime, true));

      // unbind Hamster wheel event
      scope.$on('$destroy', function(){
        //rather than trying to reference the debounced function, just remove the last one bound
        hamster.unwheel();
      });

      //scrolling morsel fallback
      //keep this here so you don't fire a scroll event in this morsel (if it's not part of a feed)
      function checkLastScroll() {
        //make sure this scroll should have an effect
        var scrollValid = false;

        if(Date.now() - (lastScrollTimestamp || 0) > scrollTimeThreshold) {
          scrollValid = true;
          lastScrollTimestamp = Date.now();
        }

        return scrollValid;
      }

      function tryGoingUp() {
        //if we're on the first item
        if (scope.currentItemIndex === 0) {
          //go to the previous morsel if we're in a feed
          if(scope.goToPrevMorsel) {
            scope.goToPrevMorsel();
          }
        } else {
          //else go to the previous item
          goToSlide(scope.currentItemIndex-1, true);
        }
      }

      function tryGoingDown() {
        //if we scroll down
        //if we're on the last item
        if(scope.currentItemIndex === scope.itemCount - 1) {
          //go to the next morsel if we're in a feed
          if(scope.goToNextMorsel) {
            scope.goToNextMorsel();
          }
        } else {
          //and aren't on the last item
          goToSlide(scope.currentItemIndex+1, true);
        }
      }

      //handle navigation for up and down keypresses
      function handleKeydown(e) {
        //make sure this morsel is currently in view - if this morsel instance is the one being viewed. if $index doesn't exist it means this one is the only one
        if(scope.$index ? scope.currentMorselIndex === scope.$index : true) {
          //ignore if it it's not coming from the body (could be in an input, etc)
          if(e.srcElement.tagName === 'BODY') {
            if(e.which === 38) {
              //up arrow pressed
              tryGoingUp();
            } else if(e.which === 40) {
              //down arrow pressed
              tryGoingDown();
            }
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
});