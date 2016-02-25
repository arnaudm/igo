'use strict';

var cls       = require('continuation-local-storage');
var winston   = require('winston');

var ns = null;

// load config
module.exports.init = function(options) {
  options = options || {};
  ns      = options.namespace || 'igo';
  cls.createNamespace(ns);
};

//
module.exports.middleware = function(req, res, next) {
  var namespace = cls.getNamespace(ns);
  namespace.bindEmitter(req);
  namespace.bindEmitter(res);
  namespace.run(function() {
    namespace.set('hello', 'World');
    try {
      next();
    } catch (err) {
      winston.error('cls caught err: ' + err);
    }
  });
};

//
module.exports.getNamespace = function(name) {
  return cls.getNamespace(name || ns);
};