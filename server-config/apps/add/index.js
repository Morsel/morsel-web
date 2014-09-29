var util = require('./../../util');

module.exports.renderAddPage = function(req, res) {
  util.updateMetadata('default', res);

  res.render('add', {
    facebookAppId : util.facebookAppId,
    //determine how to render menu
    pageType: {
      add: true
    },
    metabase: '/add',
    showAppBanner: true
  });
};
