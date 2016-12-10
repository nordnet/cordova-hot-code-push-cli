'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _watch = require('watch');

var _watch2 = _interopRequireDefault(_watch);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _hidefile = require('hidefile');

var _hidefile2 = _interopRequireDefault(_hidefile);

var _build = require('../build');

var _build2 = _interopRequireDefault(_build);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _ngrok2 = require('ngrok');

var _ngrok3 = _interopRequireDefault(_ngrok2);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ngrok = (0, _pify2.default)(_ngrok3.default); /*eslint-disable */

// TODO: add disable public tunnel!

var envFile = _path2.default.join(process.cwd(), '.chcpenv');
var buildDirectory = _path2.default.join(process.cwd(), '.chcpbuild');
var app = (0, _express2.default)();
var assetPort = process.env.PORT || 31284;
var disablePublicTunnel = process.env.DISABLE_PUBLIC_TUNNEL || false;

var socketWorker = void 0;
var chcpContext = void 0;
var sourceDirectory = void 0;
var ignoredFiles = void 0;
var opts = {};

var updateLocalEnv = function updateLocalEnv(localEnv) {
  localEnv.config_url = localEnv.content_url + '/chcp.json';

  return _utils2.default.writeFile(envFile, localEnv).then(function (_) {
    return localEnv;
  });
};

var publicTunnel = function publicTunnel(port) {
  return ngrok.connect(port).then(function (url) {
    return updateLocalEnv({
      content_url: url
    });
  }).then(function (localEnv) {
    return localEnv.content_url;
  });
};

var execute = function execute(context) {
  chcpContext = context;
  ignoredFiles = context.ignoredFiles;
  chcpContext.argv.localdev = true;
  sourceDirectory = chcpContext.sourceDirectory;

  return publicTunnel(assetPort).then(function (url) {
    chcpContext.argv.content_url = content_url;
  }).then(assetServer).then((0, _build2.default)(chcpContext)).then(function (config) {
    return updateLocalEnv({
      content_url: config.content_url
    });
  }).then(function (contentUrl) {
    return console.log('cordova-hcp public server available at: ' + contentUrl);
  });
};

var fileChangeFilter = function fileChangeFilter(file) {
  if (_hidefile2.default.isHiddenSync(file)) {
    return false;
  }

  var relativeFilePath = _path2.default.relative(chcpContext.sourceDirectory, file);
  var value = ignoredFiles.find(function (elem) {
    return (0, _minimatch2.default)(relativeFilePath, elem);
  });

  return value !== undefined;
};

var assetServer = function assetServer() {
  var localUrl = 'http://localhost:' + assetPort;

  killCaches(app);
  serveStaticAssets(app);
  serveSocketIO(app);
  watchForFileChange();
};

var watchForFileChange = function watchForFileChange() {
  console.log('Checking: ' + sourceDirectory);

  var opts = {
    filter: fileChangeFilter
  };

  var onWalk = function onWalk(file, curr, prev) {
    if (file != 'object' || prev !== null || curr !== null) {
      handleFileChange(file);
    }
  };

  _watch2.default.watchTree(sourceDirectory, opts, onWalk);
};

var handleFileChange = function handleFileChange(file) {
  console.log('File changed: ' + file);

  return (0, _build2.default)(chcpContext).then(function (config) {
    console.log('Should trigger realod for build: ' + config.release);
    socketWorker.emit('release', {
      config: config
    });
  });
};

var serveSocketIO = function serveSocketIO(app) {
  var server = app.listen(assetPort);
  socketWorker = (0, _socket2.default)(server);
  socketWorker.on('connection', function (socket) {
    console.log('user connected');
    socket.on('disconnect', function (_) {
      return console.log('user disconnected');
    });
  });
};

// Static assets
var serveStaticAssets = function serveStaticAssets(app) {
  app.use((0, _compression2.default)());
  app.enable('view cache');
  app.use('/', _express2.default.static(sourceDirectory, {
    maxAge: 0
  }));
};

// Disable caches
var killCaches = function killCaches(ass) {
  app.disable('etag');
  app.use(function (_) {
    req.headers['if-none-match'] = 'no-match-for-this';
    next();
  });
};

exports.default = execute;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map