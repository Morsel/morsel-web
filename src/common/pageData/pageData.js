angular.module( 'Morsel.pageData', [])

.factory('PageData', function($location) {
  var pageDataDefaults = {
        title: 'Morsel',
        description: 'We\'re building something awesome for the artists who use food and drink as their medium: chefs, sommeliers, mixologists and more.',
        keywords: 'chef,foodie,sommelier,mixologist,restaurant',
        image: 'http://www.eatmorsel.com/assets/images/logos/morsel-large.png', //for now
        twitter: {
          card: 'summary',
          creator: '@eatmorsel'
        },
        og: {
          type: 'website',
          url: $location.absUrl()
        }
      },
      pageData = {
        twitter: {},
        og: {}
      };
  
  return {
    reset: function() {
      pageData = {
        twitter: {},
        og: {}
      };
    },

    /* high level */
    title: function() { 
      return pageData.title || pageDataDefaults.title;
    },
    setTitle: function(newTitle) {
      pageData.title = newTitle;
    },
    description: function() { 
      return pageData.description || pageDataDefaults.description;
    },
    setDescription: function(newDescription) {
      pageData.description = newDescription;
    },
    keywords: function() {
      return pageData.keywords ||pageDataDefaults.keywords;
    },
    newKeywords: function(newKeywords) {
      pageData.keywords = newKeywords;
    },

    /* twitter */
    twitter: {
      title: function() { 
        return pageData.twitter.title || pageDataDefaults.title;
      },
      setTitle: function(newTitle) {
        pageData.twitter.title = newTitle;
      },
      description: function() { 
        return pageData.twitter.description || pageDataDefaults.description;
      },
      setDescription: function(newDescription) {
        pageData.twitter.description = newDescription;
      },
      card: function() { 
        return pageData.twitter.card || pageDataDefaults.twitter.card;
      },
      setCard: function(newCard) {
        pageData.twitter.card = newCard;
      },
      creator: function() { 
        return pageData.twitter.creator || pageDataDefaults.twitter.creator;
      },
      setCreator: function(newCreator) {
        pageData.twitter.creator = newCreator;
      },
      image: function() { 
        return pageData.twitter.image || pageDataDefaults.image;
      },
      setImage: function(newImage) {
        pageData.twitter.image = newImage;
      }
    },

    /* opengraph */
    og: {
      title: function() { 
        return pageData.og.title || pageDataDefaults.title;
      },
      setTitle: function(newTitle) {
        pageData.og.title = newTitle;
      },
      description: function() { 
        return pageData.og.description || pageDataDefaults.description;
      },
      setDescription: function(newDescription) {
        pageData.og.description = newDescription;
      },
      image: function() { 
        return pageData.og.image || pageDataDefaults.image;
      },
      setImage: function(newImage) {
        pageData.og.image = newImage;
      },
      type: function() { 
        return pageData.og.type || pageDataDefaults.og.type;
      },
      setType: function(newType) {
        pageData.og.type = newType;
      },
      url: function() { 
        return pageData.og.url || pageDataDefaults.og.url;
      },
      setUrl: function(newUrl) {
        pageData.og.url = newUrl;
      }
    }
   };
});