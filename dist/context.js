'use strict';

(function () {

  var path = require('path');
  var fs = require('fs-extra');
  var _ = require('lodash');
  var IGNORED_FILES_CONFIG_PATH = path.join(process.cwd(), '.chcpignore');
  var DEFAULT_WWW_FOLDER = path.join(process.cwd(), 'www');
  var DEFAULT_CLI_CONFIG = path.join(process.cwd(), 'cordova-hcp.json');
  var DEFAULT_IGNORE_LIST = ['.DS_Store', 'node_modules/*', 'node_modules\\*', 'chcp.json', 'chcp.manifest', '.chcp*', '.gitignore', '.gitkeep', '.git', 'package.json'];

  module.exports = {
    context: context
  };

  function context(argv) {
    return new Context(argv);
  }

  var Context = function Context(argv) {
    this.argv = argv ? argv : {};
    this.defaultConfig = DEFAULT_CLI_CONFIG;
    this.sourceDirectory = getSourceDirectory(argv);
    this.manifestFilePath = path.join(this.sourceDirectory, 'chcp.manifest');
    this.projectsConfigFilePath = path.join(this.sourceDirectory, 'chcp.json');
    this.ignoredFiles = getIgnoredFiles();
  };

  function getSourceDirectory(argv) {
    var consoleArgs = argv._;
    if (!consoleArgs || consoleArgs.length !== 2) {
      return DEFAULT_WWW_FOLDER;
    }

    return path.join(process.cwd(), consoleArgs[1]);
  }

  function getIgnoredFiles() {
    var projectIgnore = readIgnoredFilesProjectConfig(IGNORED_FILES_CONFIG_PATH);
    var ignoredList = _.union(DEFAULT_IGNORE_LIST, projectIgnore);

    // remove comments and empty items
    _.remove(ignoredList, function (item) {
      return item.indexOf('#') === 0 || _.trim(item).length === 0;
    });

    return ignoredList;
  }

  function readIgnoredFilesProjectConfig(pathToConfig) {
    var fileContent;
    try {
      fileContent = fs.readFileSync(pathToConfig, 'utf8');
    } catch (e) {
      return [];
    }

    return _.trim(fileContent).split(/\n/);
  }
})();