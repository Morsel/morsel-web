/*
 * Adapted from https://github.com/c0bra/angular-responsive-images
 *
*/
angular.module('Morsel.common.responsiveImages', [])

.directive('mrslResponsiveImages', function(presetMediaQueries, $timeout) {
  return {
    restrict: 'A',
    priority: 100,
    scope: {
      imageType: '@mrslRiImageType',
      previewImage: '@mrslRiPreload'
    },
    link: function(scope, elm, attrs) {
      // Double-check that the matchMedia function matchMedia exists
      if (typeof(matchMedia) !== 'function') {
        throw "Function 'matchMedia' does not exist";
      }

      // Array of media query and listener sets
      // 
      // {
      //    mql: <MediaQueryList object>
      //    listener: function () { ... } 
      // }
      // 
      var listenerSets = [];

      // Query that gets run on link, whenever the directive attr changes, and whenever 
      var waiting = false;
      function updateFromQuery(querySets) {
        //don't run if haven't been given any queries
        if(querySets.length === 0) {
          return;
        }

        // Throttle calling this function so that multiple media query change handlers don't try to run concurrently
        if (!waiting) {
          $timeout(function() { 
            // Destroy registered listeners, we will re-register them below
            angular.forEach(listenerSets, function(set) {
              set.mql.removeListener(set.listener);
            });

            // Clear the deregistration functions
            listenerSets = [];
            var lastTrueQuerySet;

            // for (var query in querySets) {
            angular.forEach(querySets, function(set) {
              // if (querySets.hasOwnProperty(query)) {

              var queryText = set[0];

              // If we were passed a preset query, use its value instead
              var query = queryText;
              if (presetMediaQueries.hasOwnProperty(queryText)) {
                query = presetMediaQueries[queryText];
              }

              var mq = matchMedia(query);

              if (mq.matches) {
                lastTrueQuerySet = set;
              }

              // Listener function for this query
              var queryListener = function(mql) {
                // TODO: add throttling or a debounce here (or somewhere) to prevent this function from being called a ton of times
                updateFromQuery(querySets);
              };

              // Add a listener for when this query's match changes
              mq.addListener(queryListener);

              listenerSets.push({
                mql: mq,
                listener: queryListener
              });
            });

            if (lastTrueQuerySet) {
              setSrc( lastTrueQuerySet[1] );
            }

            waiting = false;
          }, 0);
          
          waiting = true;
        }
      }

      
      function setSrc(src) {
        var preloadImg;

        if(src) {
          if(scope.imageType === 'background') {
            if(scope.previewImage) {
              //create an <img> to preload the real image
              preloadImg = angular.element('<img src="'+src+'"/>');
              //use the preview image as the bg
              elm.addClass('preloaded-image image-loading').css('background-image', 'url('+scope.previewImage+')');
              //when the preloadImg is done loading
              imagesLoaded(preloadImg, function(){
                //use the full size image
                elm.removeClass('image-loading').css('background-image', 'url('+src+')');
                //delete the preloader
                preloadImg.remove();
              });
            } else {
              elm.css('background-image', 'url('+src+')');
            }
          } else {
            if(scope.previewImage) {
              //create an <img> to preload the real image
              preloadImg = angular.element('<img src="'+src+'"/>');
              //use the preview image as the bg
              elm.addClass('preloaded-image image-loading').attr('src', scope.previewImage);
              //when the preloadImg is done loading
              imagesLoaded(preloadImg, function(){
                //use the full size image
                elm.removeClass('image-loading').attr('src', src);
                //delete the preloader
                preloadImg.remove();
              });
            } else {
              elm.attr('src', src);
            }
          }
        }
      }

      var updaterDereg;
      attrs.$observe('mrslResponsiveImages', function(value) {
        var querySets = scope.$eval(value);
        
        if (querySets instanceof Array === false) {
          throw "Expected evaluate bh-src-responsive to evaluate to an Array, instead got: " + querySets;
        }

        updateFromQuery(querySets);

        // Remove the previous matchMedia listener
        if (typeof(updaterDereg) === 'function') { updaterDereg(); }

        // Add a global match-media listener back
        // var mq = matchMedia('only screen and (min-width: 1px)');
        // console.log('mq', mq);
        // updaterDereg = mq.addListener(function(){
        //   console.log('updating!');
        //   updateFromQuery(querySets);
        // });
      });
    }
  };
});