var maxWorkers = process.env.MAX_WORKERS || 1,
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    workers = numCPUs >= maxWorkers ? maxWorkers : numCPUs,
    Logger = {},//require('./hgnode/framework/HgLog.js'),
    index = 0;

if (cluster.isMaster && ((process.env.NODE_ENV || 'local') !== 'local')) {
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
} else {
  var serverDomain = require('domain').create(),
      httpServer,
      rollbar;

  serverDomain.on('error', function (err) {
    var exceptionNotifyer = {},//require('./hgnode/framework/ExceptionNotifier.js'),
        killtimer = setTimeout(function () {
           process.exit(1);
        }, 5000);

    killtimer.unref();
    try {
      // kill rollbar
      if (rollbar) {
        rollbar.shutdown();
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
      /*exceptionNotifyer(er2, function (notifierError, notifierResponse) {
        console.log('Error cleaning up after error in cluster worker ' + process.pid + ' domain: ');
        console.log(er2.stack || er2);
        process.exit(1);
      });*/
    }
  });

  serverDomain.run(function () {
    var config;

    try{
      config = require('./config');
      console.log('Config loaded');
    } catch(err) {
      config = {};
      console.log('Config not loaded');
    }
    var rollbarAccountKey = process.env.ROLLBAR_ACCOUNT_KEY || config.rollbarAccountKey;

    // rollbar should be the first require
    if (rollbarAccountKey) {
      rollbar = require('rollbar');
      rollbar.handleUncaughtExceptions(rollbarAccountKey, {
        environment: process.env.NODE_ENV || 'local'
      });
    }

    //middleware
    var express = require("express");

    //create our app and expose it
    var app = module.exports = express();

    //load our other apps
    var utilApp = require('./util');
    var accountApp = require('./apps/account');
    var loginApp = require('./apps/login');
    var staticApp = require('./apps/static');
    var publicApp = require('./apps/public');
    var addApp = require('./apps/add');

    var forceSsl = function (req, res, next) {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
      } else {
        next();
      }
    };
    
    //force HTTPS connections
    if (utilApp.useSsl) {
      app.use(forceSsl);
    }

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

    //if/else handlebars helper
    hbs.registerHelper('ifCond', function(v1, v2, options) {
      if(v1 === v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    //static files
    app.use('/assets', express.static(__dirname + '/assets'));
    app.use('/src', express.static(__dirname + '/src'));
    app.use('/vendor', express.static(__dirname + '/vendor'));
    app.use('/launch', express.static(__dirname + '/launch'));

    //redirect all URLs (besides static files) to lowercase
    //commented out for now because it interferes with password reset tokens
    //app.use(require('express-uncapitalize')());

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

    app.get('/templates-add.js', function(req, res){
      res.sendfile('templates-add.js');
    });

    //SEO
    app.get('/BingSiteAuth.xml', function(req, res){
      res.sendfile('seo/BingSiteAuth.xml');
    });

    app.get('/bOeAHuseytu27v9K8MznKwOWZFk.html', function(req, res){
      res.sendfile('seo/bOeAHuseytu27v9K8MznKwOWZFk.html');
    });

    //www.eatmorsel.com
    app.get('/google1739f11000682532.html', function(req, res){
      res.sendfile('seo/google1739f11000682532.html');
    });

    //https://www.eatmorsel.com
    app.get('/google644ff905bdb735d2.html', function(req, res){
      res.sendfile('seo/google644ff905bdb735d2.html');
    });

    app.get('/pinterest-98fe2.html', function(req, res){
      res.sendfile('seo/pinterest-98fe2.html');
    });

    app.get('/robots.txt', function(req, res){
      res.sendfile('seo/robots.txt');
    });

    //unsubscribe
    app.get('/unsubscribe', function(req, res){
      res.render('unsubscribe');
    });

    //FOR APP
    app.get('/terms_text', function(req, res) {
      res.set('Content-Type', 'text/html').sendfile('views/partials/static/terms.hbs');
    });

    app.get('/privacy_text', function(req, res) {
      res.set('Content-Type', 'text/html').sendfile('views/partials/static/privacy.hbs');
    });

    //LOGIN

    //login convenience
    app.get('/login', function(req, res){
      res.redirect('/auth/login');
    });

    //logout convenience
    app.get('/logout', function(req, res){
      res.redirect('/auth/logout');
    });

    //join convenience
    app.get('/join', function(req, res){
      res.redirect('/auth/join');
    });

    //twitter auth
    app.get('/auth/twitter/connect', function(req, res){
      loginApp.getTwitterOAuthRequestToken(req, res);
    });

    app.get('/auth/twitter/callback', function(req, res){
      loginApp.getTwitterOAuthAccessToken(req, res);
    });

    //catch all our requests
    app.get('/auth*', function(req, res){
      loginApp.renderLoginPage(res);
    });

    //admin requests - right now just shadow users. break out into
    //separate angular project eventually
    app.get('/admin*', function(req, res){
      loginApp.renderLoginPage(res);
    });

    //ACCOUNT
    app.get('/account*', function(req, res){
      accountApp.renderAccountPage(req, res);
    });

    //ADD
    app.get('/add*', function(req, res){
      addApp.renderAddPage(req, res);
    });

    //PUBLIC

    //RIA
    app.get('/ria', function(req, res){
      res.redirect('/');
    });

    //feed
    app.get('/feed', function(req, res){
      var metadata = utilApp.getMetadata('feed');

      publicApp.renderPublicPage(res, metadata);
    });

    //explore
    app.get('/explore', function(req, res){
      publicApp.renderPublicPage(res);
    });

    //contact
    app.get('/contact', function(req, res){
      var metadata = utilApp.getMetadata('contact');

      publicApp.renderPublicPage(res, metadata);
    });

    //activity
    app.get('/activity', function(req, res){
      publicApp.renderPublicPage(res);
    });

    //notifications
    app.get('/notifications', function(req, res){
      publicApp.renderPublicPage(res);
    });

    //search
    app.get('/search', function(req, res){
      res.redirect('/search/people');
    });

    app.get('/search*', function(req, res){
      var metadata = utilApp.getMetadata('search');

      publicApp.renderPublicPage(res, metadata);
    });

    //invite
    app.get('/invite', function(req, res){
      publicApp.renderPublicPage(res);
    });

    //convenience route
    app.get('/users/:id', function(req, res){
      var id = req.params.id;

      publicApp.renderUserPage(res, id);
    });

    //places
    app.get('/places/:placeidslug', function(req, res){
      publicApp.renderPlacePage(res, req.params.placeidslug);
    });

    //events
    app.get('/events/:eventslug', function(req, res){
      publicApp.renderEventPage(res, req.params.eventslug);
    });

    //collections (fake events, for now)
    app.get('/collections/:collectionslug', function(req, res){
      publicApp.renderEventPage(res, req.params.collectionslug);
    });

    //profile page likes
    app.get('/:username/likes', function(req, res) {
      publicApp.renderPublicPage(res);
    });

    //profile page places
    app.get('/:username/places', function(req, res) {
      publicApp.renderPublicPage(res);
    });

    //profile page collections
    app.get('/:username/collections', function(req, res) {
      publicApp.renderPublicPage(res);
    });

    //collection details
    app.get('/:username/collections/:collectionIdSlug', function(req, res) {
      publicApp.renderCollectionPage(req, res);
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

    if(rollbar) {
      app.use(rollbar.errorHandler(rollbarAccountKey, {
        environment: utilApp.nodeEnv
      }));
    }

    httpServer = app.listen(utilApp.port, function() {
      console.log("Listening on " + utilApp.port);
    });
  });
}