

const _                 = require('lodash');
const compression       = require('compression');
const cookieParser      = require('cookie-parser');
const cookieSession     = require('cookie-session');
const express           = require('express');
const i18nFsBackend     = require('i18next-fs-backend');
const i18nMiddleware    = require('i18next-http-middleware');
const i18next           = require('i18next');
const igodust           = require('./engines/igodust');
const cache             = require('./cache');
const cls               = require('./cls');
const config            = require('./config');
const dbs               = require('./db/dbs');
const errorHandler      = require('./connect/errorhandler');
const flash             = require('./connect/flash');
const locals            = require('./connect/locals');
const multipart         = require('./connect/multipart');
const validator         = require('./connect/validator');
const logger            = require('./logger');
const mailer            = require('./mailer');
const plugins           = require('./plugins');

//
const app = module.exports = express();

// services to initialize
const SERVICES = [ config, igodust, logger, cache, dbs, mailer, cls, plugins ]

//
module.exports.configure = function() {

  SERVICES.forEach(service => service.init(app));

  i18next
    .use(i18nMiddleware.LanguageDetector)
    .use(i18nFsBackend)
    .init(config.i18n);

  app.enable('trust proxy');
  app.disable('x-powered-by');

  app.use(compression());
  app.use(express.static('public'));
  
  if (config.env !== 'test') {

    app.use(errorHandler.init(app));

    app.use(cookieParser(config.cookieSecret || config.signedCookiesSecret));
    app.use(cookieSession(config.cookieSession || config.cookieSessionConfig));

    app.use(express.urlencoded({ limit: '10mb', extended: true }));
    app.use(express.json({ limit: '10mb' }));

    app.use(multipart);
  }
  
  app.use(flash);
  app.use(validator);
  app.use(i18nMiddleware.handle(i18next));
  app.use(locals);
  app.use(igodust.middleware);

  // load routes
  const routes = require('./routes');
  routes.init(app);

  if (config.env !== 'test') {
    app.use(errorHandler.error);
  }

}

// configured: callback function invoked when app is configured
// started: callback function invoked when server is started
module.exports.run = function(configured, started) {

  module.exports.configure();
  configured && configured();

  app.server = app.listen(config.httpport, function() {
    logger.info('Listening to port %s', config.httpport);
    started && started();
  });
};
