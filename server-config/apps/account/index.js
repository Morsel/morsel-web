var util = require('./../../util');

module.exports.test = function(req, res){
  res.send('testing account');
};

module.exports.renderAccountPage = function(req, res) {
  util.updateMetadata('default');

  res.render('account', {
    facebookAppId : util.facebookAppId,
    //determine how to render menu
    pageType: {
      account: true
    }
  });
};
