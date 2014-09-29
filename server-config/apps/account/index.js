var util = require('./../../util');

module.exports.renderAccountPage = function(req, res, twitterData) {
  var twitterData;

  util.updateMetadata('default', res);

  //if user is trying to add social account
  if(req.session.social && req.session.tData) {
    twitterData = req.session.tData;
    //remove for the rest of the session
    delete req.session.social;
    delete req.session.tData;
  }

  res.render('account', {
    facebookAppId : util.facebookAppId,
    twitterData : JSON.stringify(twitterData) || 'null',
    //determine how to render menu
    pageType: {
      account: true
    },
    metabase: '/account',
    showAppBanner: true
  });
};
