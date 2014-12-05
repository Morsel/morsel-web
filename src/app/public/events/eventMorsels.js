angular.module( 'Morsel.public.eventMorsels', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'eventMorsels', {
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
  })
  //temporary solution for allows collections
  .state( 'collectionMorsels', {
    url: '/collections/:eventSlug',
    views: {
      "main": {
        controller: 'EventMorselsCtrl',
        templateUrl: 'app/public/events/eventMorsels.tpl.html'
      }
    },
    data:{ pageTitle: 'Collection' },
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
  } else if(eventSlug === 'michael-ruhlman-charcuterie-book') {
    eventUrl += 'michael-ruhlman-charcuterie-book/michael-ruhlman-charcuterie-book-morsels.json';
    eventInfo.title = 'Michael Ruhlman Charcuterie Book';
    eventInfo.location = null;
    eventInfo.description = $sce.trustAsHtml('<strong>Charcuterie</strong> exploded onto the scene in 2005 and encouraged an army of home cooks and professional chefs to start curing their own foods. Ruhlman and Polcyn teamed up to share their passion for cured meats with a wider audience. The rest is culinary history.<br/><br/>Check out what the world is creating from <strong>Charcuterie</strong> and submit your creation on Morsel by using hashtag #RuhlmanCharcuterie');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/michael-ruhlman-charcuterie-book/michael-ruhlman-charcuterie-book-logo.jpg';
    eventInfo.url = 'https://www.eatmorsel.com/collections/michael-ruhlman-charcuterie-book';
    eventInfo.twitterUsername = '@ruhlman';
  } else if(eventSlug === 'spence-farm-foundation-dinner-2014') {
    eventUrl += 'spence-farm-foundation-dinner-2014/spence-farm-foundation-dinner-2014-morsels.json';
    eventInfo.title = 'Spence Farm Foundation Dinner 2014';
    eventInfo.location = null;
    eventInfo.description = $sce.trustAsHtml('On October 20, 2014, the Spence Farm Family Foundation held a special celebration of local Fall food with chefs from Green Zebra, Browntrout, Limelight Catering and 676 Restaurant & Bar at the Omni Hotel Chicago.');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/spence-farm-foundation-dinner-2014/spence-farm-foundation-dinner-2014-logo.jpg';
    eventInfo.url = 'https://www.eatmorsel.com/collections/spence-farm-foundation-dinner-2014';
    eventInfo.twitterUsername = '@SpenceFarmFound';
  } else if(eventSlug === 'slow-food-ark-of-taste') {
    eventUrl += 'slow-food-ark-of-taste/slow-food-ark-of-taste-morsels.json';
    eventInfo.title = 'Slow Food Ark of Taste';
    eventInfo.location = null;
    eventInfo.description = $sce.trustAsHtml('The Ark of Taste travels the world collecting small-scale quality productions that belong to the cultures, history and traditions of the entire planet: an extraordinary heritage of fruits, vegetables, animal breeds, cheeses, breads, sweets and cured meats...<br/><br/>The Ark was created to <strong>point out the existence</strong> of these products, <strong>draw attention</strong> to the risk of their extinction within a few generations, <strong>invite everyone to take action</strong> to help protect them. In some cases this might be by buying and consuming them, in some by telling their story and supporting their producers, and in others, such as the case of endangered wild species, this might mean eating less or none of them in order to preserve them and favor their reproduction.');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/slow-food-ark-of-taste/slow-food-ark-of-taste-logo.jpg';
    eventInfo.url = 'https://www.eatmorsel.com/collections/slow-food-ark-of-taste';
    eventInfo.twitterUsername = '@SlowFoodUSA';
  } else if(eventSlug === 'meals-on-wheels-chicago-celebrity-chef-ball-2014') {
    eventUrl += 'meals-on-wheels-chicago-celebrity-chef-ball-2014/meals-on-wheels-chicago-celebrity-chef-ball-2014-morsels.json';
    eventInfo.title = 'Meals on Wheels Chicago Celebrity Chef Ball 2014';
    eventInfo.location = null;
    eventInfo.description = $sce.trustAsHtml('The Meals on Wheels Chicago Celebrity Chef Ball is one of Chicago\'s longest-running culinary fundraisers, raising more than $200,000 each year in support of the organization\'s mission to ensure that both homebound seniors and individuals with disabilities benefit from programs that improve their quality of life and maximize independence.<br/><br/>Here\'s a peek at 2014\'s amazing event!');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/meals-on-wheels-chicago-celebrity-chef-ball-2014/meals-on-wheels-chicago-celebrity-chef-ball-2014-logo.jpg';
    eventInfo.url = 'https://www.eatmorsel.com/collections/meals-on-wheels-chicago-celebrity-chef-ball-2014';
    eventInfo.twitterUsername = '@MOWChicago';
  } else if(eventSlug === 'rare-tea-cellar-clients') {
    eventUrl += 'rare-tea-cellar-clients/rare-tea-cellar-clients-morsels.json';
    eventInfo.title = 'Rare Tea Cellar Clients';
    eventInfo.location = null;
    eventInfo.description = $sce.trustAsHtml('Rare Tea Cellar specializes in the finest and rarest teas and ingredients available on planet earth. For over 15 years RTC has supplied top chefs, hotels, restaurants and mixologists with unique ingredients.<br/><br/>Take a look at what our amazing clients are doing with our teas!');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/rare-tea-cellar-clients/rare-tea-cellar-clients-logo.jpg';
    eventInfo.url = 'https://www.eatmorsel.com/collections/rare-tea-cellar-clients';
    eventInfo.twitterUsername = '@RARETEACELLAR';
  } else if(eventSlug === 'ideas-in-food-our-community-in-action') {
    eventUrl += 'ideas-in-food-our-community-in-action/ideas-in-food-our-community-in-action-morsels.json';
    eventInfo.title = 'Ideas in Food - Our Community in Action';
    eventInfo.location = null;
    eventInfo.description = $sce.trustAsHtml('Aki Kamozawa and H. Alexander Talbot published <b>Ideas in Food, Great Recipes and Why They Work</b> in December 2010. The book shares the knowledge gleaned from numerous cooking adventures, from why tapioca flour makes a silkier chocolate pudding than the traditional cornstarch or flour to how to cold smoke just about any ingredient you can think of to impart a new savory dimension to everyday dishes. Perfect for anyone who loves food, Ideas in Food is the ideal handbook for unleashing creativity, intensifying flavors, and pushing one’s cooking to new heights.<br/><br/>This collection is a showcase of the amazing things our community is doing with this book.');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/ideas-in-food-our-community-in-action/ideas-in-food-our-community-in-action-logo.png';
    eventInfo.url = 'https://www.eatmorsel.com/collections/ideas-in-food-our-community-in-action';
    eventInfo.twitterUsername = '@ideasinfood';
  } else if(eventSlug === 'wirtz-beverage-meals-on-wheels-celebrity-chef-ball-2014') {
    eventUrl += 'wirtz-beverage-meals-on-wheels-celebrity-chef-ball-2014/wirtz-beverage-meals-on-wheels-celebrity-chef-ball-2014-morsels.json';
    eventInfo.title = 'Wirtz Beverage - Meals on Wheels Chicago Celebrity Chef Ball 2014';
    eventInfo.location = null;
    eventInfo.description = $sce.trustAsHtml('Wirtz Beverage Group is a proud sponsor of the Meals on Wheels Chicago 2014 Celebrity Chef Ball. Each year, this event brings together some of Chicago\'s brightest culinary stars to create one-of-a-kind dishes paired with exclusive cocktails prepared by celebrated mixologists.<br/><br/>Here\'s a look back at some of the delicious cocktails served this year.');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/wirtz-beverage-meals-on-wheels-celebrity-chef-ball-2014/wirtz-beverage-meals-on-wheels-celebrity-chef-ball-2014-logo.jpg';
    eventInfo.url = 'https://www.eatmorsel.com/collections/wirtz-beverage-meals-on-wheels-celebrity-chef-ball-2014';
    eventInfo.twitterUsername = '@wirtzbevgroup';
  } else if(eventSlug === 'tasting-table-community') {
    eventUrl += 'tasting-table-community/tasting-table-community-morsels.json';
    eventInfo.title = 'Tasting Table - Our Community';
    eventInfo.location = null;
    eventInfo.description = $sce.trustAsHtml('Tasting Table is a website and newsletter for culinary enthusiasts. The Tasting Table team eats high and low to bring you the discerning dining advice, recipes you can trust and news you can use from the world of food and drink.<br/><br/>Here\'s a peak at what the Morsel community is doing with Tasting Table recipes.');
    eventInfo.image = 'https://morsel.s3.amazonaws.com/events/tasting-table-community/tasting-table-community-logo.gif';
    eventInfo.url = 'https://www.eatmorsel.com/collections/tasting-table-community';
    eventInfo.twitterUsername = '@tastingtable';
  } else {
    //invalid event
    $location.path('/');
  }

  Restangular.oneUrl('eventMorsels', eventUrl).get().then(function(resp) {
    eventInfo.morsels = Restangular.stripRestangular(resp);
    $scope.eventInfo = eventInfo;
    $scope.pageData.pageTitle = $scope.eventInfo.title + ($scope.eventInfo.location ? ' | ' + $scope.eventInfo.location : '');
  }, function() {
    //if not, send to homepage
    $location.path('/');
  });
});