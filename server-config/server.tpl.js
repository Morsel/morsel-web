/*var maxWorkers = process.env.MAX_WORKERS || 1,
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    workers = numCPUs >= maxWorkers ? maxWorkers : numCPUs,
    Logger = {},//require('./hgnode/framework/HgLog.js'),
    index = 0;
*/
/*if (cluster.isMaster && !process.env.LOCAL_DEBUG) {
  //Logger.info('Web server initializing with a maximum of ' + maxWorkers + ' workers. Master PID: ' + process.pid);
  //Logger.info(numCPUs + ' CPUs detected. Clustering up to ' + workers + ' instances.');

  cluster.on('exit', function (worker, code, signal) {
    if (code !== 130) {
      //Logger.warn('Cluster worker ' + worker.process.pid + ' died. code: \'' + code + '\' signal: \'' + (signal || '') + '\' restarting.');
      cluster.fork();
    } else {
      //Logger.info('Cluster worker ' + worker.process.pid + ' died. code: ' + code + ' signal: ' + (signal || '') + ' not restarting due to shutdown.');
    }
  });

  cluster.on('listening', function (worker, address) {
    //Logger.info('Cluster worker ' + worker.process.pid + ' is now connected to ' + address.address + ':' + address.port);
  });

  process.on('SIGINT', function () {
    //Logger.info('SIGINT received, waiting for connections to finish so process can exit gracefully.');
    cluster.disconnect(function () {
      //Logger.info('Cluster has gracefully shutdown.');
      process.exit(1);
    });
  });

  for (index = 0; index < workers; index += 1) {
    cluster.fork();
  }
} else {*/
/*  var serverDomain = require('domain').create(),
      httpServer,
      nodetime;

  serverDomain.on('error', function (err) {
    var exceptionNotifyer = {},//require('./hgnode/framework/ExceptionNotifier.js'),
        killtimer = setTimeout(function () {
           process.exit(1);
        }, 5000);

    killtimer.unref();
    try {
      // kill nodetime
      if (nodetime) {
        nodetime.destroy();
      }
      if (httpServer) {
        // force all connections to be zero so callback can be called without throwing another exception
        httpServer._connections = 0;
        httpServer.close(function () {
           cluster.worker.disconnect();
        });
      } else if (cluster.worker) {
        cluster.worker.disconnect();
      }
      //exceptionNotifyer(err);
      // change this to the console logger - since there is now no connections to the database
      console.log('Unhandled Exception in domain of cluster worker ' + process.pid);
      console.log(err.stack || err);
    } catch (er2) {
      */
      /*exceptionNotifyer(er2, function (notifierError, notifierResponse) {
        console.log('Error cleaning up after error in cluster worker ' + process.pid + ' domain: ');
        console.log(er2.stack || er2);
        process.exit(1);
      });*/
/*    }
  });
*/
//  serverDomain.run(function () {
    // nodetime should be the first require
/*    if (process.env.NODETIME_ACCOUNT_KEY) {
      nodetime = require('nodetime');
      nodetime.profile({
        accountKey: process.env.NODETIME_ACCOUNT_KEY,
        appName: process.env.NODE_ENV || 'local-dev'
      });
    }
*/
    //middleware
    var express = require("express");

    //create our app and expose it
    var app = module.exports = express();
    var port = Number(process.env.PORT || 5000);

    //load our other apps
    var utilApp = require('./util');
    var accountApp = require('./apps/account');
    var loginApp = require('./apps/login');
    var staticApp = require('./apps/static');
    var publicApp = require('./apps/public');

    //enable gzip
    var compress = require('compression');
    app.use(compress());

    //set up sessions
    var cookieParser = require('cookie-parser');
    var session = require('express-session');
    app.use(cookieParser());
    app.use(session({secret: utilApp.sessionSecret}));

    //use hbs for templates
    var hbs = require('hbs');
    hbs.registerPartials(__dirname + '/views/partials');
    app.set('view engine', 'hbs');
    app.set('views', __dirname + '/views');

    //expose our locals
    hbs.localsAsTemplateData(app);

    //static files
    app.use('/assets', express.static(__dirname + '/assets'));
    app.use('/src', express.static(__dirname + '/src'));
    app.use('/vendor', express.static(__dirname + '/vendor'));
    app.use('/launch', express.static(__dirname + '/launch'));

    //set our initial default metadata
    utilApp.updateMetadata('default');

    //routes

    //HOME
    app.get('/', function(req, res) {
      var metadata = utilApp.getMetadata('home');

      publicApp.renderPublicPage(res, metadata);
    });

    //TEMPLATES
    app.get('/templates-public.js', function(req, res){
      res.sendfile('templates-public.js');
    });

    app.get('/templates-account.js', function(req, res){
      res.sendfile('templates-account.js');
    });

    app.get('/templates-login.js', function(req, res){
      res.sendfile('templates-login.js');
    });

    app.get('/templates-static.js', function(req, res){
      res.sendfile('templates-static.js');
    });

    //SEO
    app.get('/BingSiteAuth.xml', function(req, res){
      res.sendfile('seo/BingSiteAuth.xml');
    });

    app.get('/bOeAHuseytu27v9K8MznKwOWZFk.html', function(req, res){
      res.sendfile('seo/bOeAHuseytu27v9K8MznKwOWZFk.html');
    });

    app.get('/google1739f11000682532.html', function(req, res){
      res.sendfile('seo/google1739f11000682532.html');
    });

    app.get('/pinterest-98fe2.html', function(req, res){
      res.sendfile('seo/pinterest-98fe2.html');
    });

    //unsubscribe
    app.get('/unsubscribe', function(req, res){
      res.render('unsubscribe');
    });

    app.get('/testing', function(req, res){
      accountApp.test(req, res);
    });

    //ACCOUNT
    app.get('/account*', function(req, res){
      accountApp.renderAccountPage(req, res);
    });

    //LOGIN

    //login
    app.get('/login', function(req, res){
      loginApp.renderLoginPage(res);
    });

    //logout
    app.get('/logout', function(req, res){
      loginApp.renderLoginPage(res);
    });

    //join
    app.get('/join/:step', function(req, res){
      loginApp.renderLoginPage(res);
    });

    app.get('/join', function(req, res){
      loginApp.renderLoginPage(res);
    });

    //password reset
    app.get('/password-reset', function(req, res){
      loginApp.renderLoginPage(res);
    });

    //password reset
    app.get('/password-reset/new', function(req, res){
      loginApp.renderLoginPage(res);
    });

    //twitter auth
    app.get('/auth/twitter/connect', function(req, res){
      loginApp.getTwitterOAuthRequestToken(req, res);
    });

    app.get('/auth/twitter/callback', function(req, res){
      loginApp.getTwitterOAuthAccessToken(req, res);
    });

    //feed
    app.get('/feed', function(req, res){
      var metadata = utilApp.getMetadata('feed');

      publicApp.renderPublicPage(res, metadata);
    });

    //morsel detail with post id/slug
    app.get('/:username/:postidslug', function(req, res){
      publicApp.renderMorselPage(req, res);
    });

    //anything with a single route param
    app.get('/:route', function(req, res, next){
      utilApp.handleSingleRoute(req, res, next);
    });

    //anything else must be a 404 at this point
    app.get('*', function(req, res) {
      utilApp.render404(res);
    });

    httpServer = app.listen(port, function() {
      console.log("Listening on " + port);
    });
 // });
//}