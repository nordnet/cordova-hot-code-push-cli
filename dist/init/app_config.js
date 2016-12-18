'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isShortVersion = {
  description: 'Would you like a short or full version?',
  default: 'short',
  message: 'allowed: short, full',
  pattern: /(short|full)/,
  before: function before(value) {
    return value === 'short';
  }
};

var contentDir = {
  description: 'Content directory path',
  message: 'Provide a url (or relative path on the server), where your web content is located',
  required: true
};

var contentConfig = {
  description: 'Application\'s config URL (skip, if it\'s in content\'s directory root)',
  ask: function ask() {
    return !_prompt2.default.history('isShortVersion').value;
  },
  before: function before(value) {
    if (value) {
      return value;
    }

    var contentDirUrl = _prompt2.default.history('contentDir').value;
    if (contentDirUrl.indexOf('/') !== contentDirUrl.length - 1) {
      contentDirUrl += '/';
    }

    return contentDirUrl + 'chcp.json';
  }
};

var releaseVersionsCompare = {
  description: 'How release versions should be compared?',
  message: 'allowed: !=, >, <',
  pattern: /(!=|>|<)/,
  default: '!=',
  ask: function ask() {
    return !_prompt2.default.history('isShortVersion').value;
  }
};

var minNativeInterface = {
  description: 'Required version of the native side',
  default: 1,
  ask: function ask() {
    return !_prompt2.default.history('isShortVersion').value;
  }
};

var autoDownload = {
  description: 'Is auto download enabled? (y/n)',
  pattern: /(y|n)/,
  message: '\'y\' or \'n\'',
  default: 'y',
  before: function before(value) {
    return value === 'y';
  },
  ask: function ask() {
    return !_prompt2.default.history('isShortVersion').value;
  }
};

var autoDownloadPhase = {
  description: 'When update download should be performed?',
  pattern: /(onstart|onresume)/,
  message: 'allowed: onstart, onresume',
  default: 'onstart',
  ask: function ask() {
    return !_prompt2.default.history('isShortVersion').value && _prompt2.default.history('autoDownload').value;
  }
};

var autoInstall = {
  description: 'Is auto install enabled? (y/n)',
  pattern: /(y|n)/,
  message: 'should be \'y\' or \'n\'',
  default: 'y',
  before: function before(value) {
    return value === 'y';
  },
  ask: function ask() {
    return !_prompt2.default.history('isShortVersion').value;
  }
};

var autoInstallPhase = {
  description: '',
  pattern: /(onstart|onresume|ondownload)/,
  message: 'allowed: onstart, onresume, ondownload',
  default: 'onstart',
  ask: function ask() {
    return !_prompt2.default.history('isShortVersion').value && _prompt2.default.history('autoInstall').value;
  }
};

var pathToSourceDir = {
  description: 'Where to put generated config?',
  default: 'www'
};

var schema = {
  properties: {
    isShortVersion: isShortVersion,
    contentDir: contentDir,
    contentConfig: contentConfig,
    releaseVersionsCompare: releaseVersionsCompare,
    minNativeInterface: minNativeInterface,
    autoDownload: autoDownload,
    autoDownloadPhase: autoDownloadPhase,
    autoInstall: autoInstall,
    autoInstallPhase: autoInstallPhase,
    pathToSourceDir: pathToSourceDir
  }
};

var generateFullConfig = function generateFullConfig(input) {
  var config = {
    release: {
      version: _utils2.default.generateReleaseNumber(),
      compare: input.releaseVersionsCompare,
      min_native_interface: input.minNativeInterface
    },
    content: {
      dir: input.contentDir,
      config: input.contentConfig
    },
    update_auto_download: {
      enabled: input.autoDownload,
      phase: input.autoDownloadPhase
    },
    update_auto_install: {
      enabled: input.autoInstall,
      phase: input.autoInstallPhase
    }
  };

  return {
    config: config,
    dst: input.pathToSourceDir
  };
};

var generateShortConfig = function generateShortConfig(input) {
  return {
    config: {
      release: _utils2.default.generateReleaseNumber(),
      content: input.contentDir
    },
    dst: input.pathToSourceDir
  };
};

var generateConfig = function generateConfig(userInput) {
  return userInput.isShortVersion ? generateShortConfig(userInput) : generateFullConfig(userInput);
};

var saveConfig = function saveConfig(config) {
  var pathToConfig = _path2.default.join(process.cwd(), config.dst, 'chcp.json');

  return _utils2.default.writeFile(pathToConfig, config.config).then(function (_) {
    return config;
  });
};

var done = function done(config) {
  console.log('Generated new application\'s config in ' + config.dst + ':');
  console.log(JSON.stringify(config.config, null, 2));
};

var requestUserInput = _utils2.default.getInput(schema);

var execute = function execute(context) {
  console.log('Initializing application\'s config');

  return _ramda2.default.pipeP(requestUserInput, generateConfig, saveConfig, done)(context.argv);
};

exports.default = execute;
module.exports = exports['default'];
//# sourceMappingURL=app_config.js.map