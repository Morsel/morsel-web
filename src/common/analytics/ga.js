angular.module( 'Morsel.common.ga', [])

//handle sending Google Analytics Universal Analytics events
.factory('GA', function($location) {
  return {
    sendPageview : function(title) {
      var pageData = {
            'page': $location.path()
          };

      if(title) {
        pageData.title = title;
      }

      if(window.ga) {
        ga('send', 'pageview', pageData);
      } else {
        console.log('GA Pageview: ', pageData);
      }
    }
  };
});