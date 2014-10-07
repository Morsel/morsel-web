angular.module( 'Morsel.public.eventMorsels', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'eventMorsels', {
    //make sure our "username" isn't "users"
    url: '/events/:eventName',
    views: {
      "main": {
        controller: 'EventMorselsCtrl',
        templateUrl: 'app/public/events/eventMorsels.tpl.html'
      }
    },
    data:{ pageTitle: 'Event' },
    resolve: {
      //get current user data before displaying so we don't run into odd situations of trying to perform user actions before user is loaded
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'EventMorselsCtrl', function EventMorselsCtrl( $scope, $location, $stateParams, $q, Restangular, $sce ) {
  var eventName = $stateParams.eventName.toLowerCase(),
      eventUrl = 'https://morsel.s3.amazonaws.com/events/',
      deferred = $q.defer(),
      eventInfo = {};

  //check for valid events
  if(eventName === 'taste-talks-2014') {
    eventUrl += 'taste-talks-2014/taste-talks-2014-morsels.json';
    eventInfo.title = 'Taste Talks 2014';
    eventInfo.location = 'Chicago, IL';
    eventInfo.description = $sce.trustAsHtml('Taste Talks is a three-day food festival in Brooklyn and Chicago exploring the culinary cutting edge for a food-obsessed generation. Using the <a href="/apps" target="_self">Morsel iOS app</a>, chefs from the Chicago event captured these stories and inspirations throughout the weekend.');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/taste-talks-2014/taste-talks-2014-logo.jpeg';
  } else {
    //invalid event
    $location.path('/');
  }

  Restangular.oneUrl('eventMorsels', eventUrl).get().then(function(resp) {
    eventInfo.morsels = Restangular.stripRestangular(resp);
    $scope.eventInfo = eventInfo;
    $scope.pageData.pageTitle = $scope.eventInfo.title + ' | ' + $scope.eventInfo.location;
  }, function() {
    //if not, send to homepage
    $location.path('/');
  });
});