var util = require('./../../util');

module.exports.renderStaticPage = function(res, route) {
  var templateVars = {
        staticPartial: {},
        //determine how to render menu
        pageType: {
          static: true
        }
      };

  util.updateMetadata(route);

  //set a var here to let our static template render off it
  templateVars.staticPartial[route] = true;

  res.render('static', templateVars);
};
