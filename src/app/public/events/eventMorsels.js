angular.module( 'Morsel.public.eventMorsels', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'eventMorsels', {
    //make sure our "username" isn't "users"
    url: '/events/:eventSlug',
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
  var eventSlug = $stateParams.eventSlug.toLowerCase(),
      eventUrl = 'https://morsel.s3.amazonaws.com/events/',
      deferred = $q.defer(),
      eventInfo = {};

  //check for valid events
  if(eventSlug === 'taste-talks-chicago-2014') {
    eventUrl += 'taste-talks-chicago-2014/taste-talks-chicago-2014-morsels.json';
    eventInfo.title = 'Taste Talks 2014';
    eventInfo.location = 'Chicago, IL';
    eventInfo.description = $sce.trustAsHtml('Taste Talks is a three-day food festival in Brooklyn and Chicago exploring the culinary cutting edge for a food-obsessed generation. Using the <a href="/apps" target="_self">Morsel iOS app</a>, chefs from the Chicago event captured these stories and inspirations throughout the weekend.');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/taste-talks-chicago-2014/taste-talks-chicago-2014-logo.jpeg';
    eventInfo.url = 'https://www.eatmorsel.com/events/taste-talks-chicago-2014';
    eventInfo.twitterUsername = '@tastetalks';
  } else if(eventSlug === 'dinner-lab-taste-talks-chicago-2014') {
    eventUrl += 'dinner-lab-taste-talks-chicago-2014/dinner-lab-taste-talks-chicago-2014-morsels.json';
    eventInfo.title = 'Dinner Lab - Taste Talks 2014';
    eventInfo.location = 'Chicago, IL';
    eventInfo.description = $sce.trustAsHtml('Dinner Lab is a social dining experiment that unites undiscovered chefs with adventurous diners who are looking for something different from the conventional restaurant experience. On October 4th, chef Pat Sheerin of Trencherman created a dinner like you\'ve never experienced before as part of the Taste Talks Festival.');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/dinner-lab-taste-talks-chicago-2014/dinner-lab-logo.jpg';
    eventInfo.url = 'https://www.eatmorsel.com/events/dinner-lab-taste-talks-chicago-2014';
    eventInfo.twitterUsername = '@dinnerlab';
  } else if(eventSlug === 'sound-opinions-eat-to-the-beat-velvet-underground-nico') {
    eventUrl += 'sound-opinions-eat-to-the-beat-velvet-underground-nico/sound-opinions-eat-to-the-beat-velvet-underground-nico-morsels.json';
    eventInfo.title = 'Sound Opinions - Eat to the Beat at Nico Osteria';
    eventInfo.location = 'Chicago, IL';
    eventInfo.description = $sce.trustAsHtml('On Sunday, October 12, 2014, Chefs <strong>Paul Kahan</strong> of <a href="http://www.nicoosteria.com/" target="_blank">Nico Osteria</a>, Blackbird, and the Publican, and <strong>Matthias Merges</strong> of <a href="http://yusho-chicago.com/" target="_blank">Yusho</a>, Billy Sunday and A10 presented a spectacular multi-course dinner inspired by the groundbreaking 1967 album The Velvet Underground & Nico - with special guest Velvet Underground founder <strong>John Cale</strong>.');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/sound-opinions-eat-to-the-beat-velvet-underground-nico/sound-opinions-eat-to-the-beat-velvet-underground-nico-logo.jpg';
    eventInfo.url = 'https://www.eatmorsel.com/events/sound-opinions-eat-to-the-beat-velvet-underground-nico';
    eventInfo.twitterUsername = '@soundopinions';
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