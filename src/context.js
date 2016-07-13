import path from 'path';
import fs from 'fs';
import _ from 'lodash';

const cwd = process.cwd();
const IGNORED_FILES_CONFIG_PATH = path.join(cwd, '.chcpignore');
const DEFAULT_WWW_FOLDER = path.join(cwd, 'www');
const DEFAULT_CLI_CONFIG = path.join(cwd, 'cordova-hcp.json');
const DEFAULT_IGNORE_LIST = [
  '.DS_Store',
  'node_modules/*',
  'node_modules\\*',
  'chcp.json',
  'chcp.manifest',
  '.chcp*',
  '.gitignore',
  '.gitkeep',
  '.git',
  'package.json'
];
const CHCP_MANIFEST_FILE_NAME = 'chcp.manifest';
const CHCP_CONFIG_FILE_NAME = 'chcp.json';

const sourcesDirectory = (argv) => {
  const consoleArgs = argv._;
  if (!consoleArgs || consoleArgs.length !== 2) {
    return DEFAULT_WWW_FOLDER;
  }

  return path.join(cwd, consoleArgs[1]);
}

const ignoredFiles = () => {
  return readIgnoredFilesProjectConfig(IGNORED_FILES_CONFIG_PATH).concat(DEFAULT_IGNORE_LIST).filter(noComments);
}

const noComments = (item) => {
  return item.trim().length > 0 && item.indexOf('#') !== 0;
}

const readIgnoredFilesProjectConfig = (pathToConfig) => {
  try {
    return fs.readFileSync(pathToConfig, 'utf8').trim().split(/\n/);
  } catch (e) {
    return [];
  }
}

module.exports = (argv) => {
  const args = argv || {};
  const wwwDir = sourcesDirectory(args);
  const manifestFilePath = path.join(wwwDir, CHCP_MANIFEST_FILE_NAME);
  const projectsConfigFilePath = path.join(wwwDir, CHCP_CONFIG_FILE_NAME);

  return {
    argv: args,
    defaultConfig: DEFAULT_CLI_CONFIG,
    sourceDirectory: wwwDir,
    manifestFilePath: manifestFilePath,
    projectsConfigFilePath: projectsConfigFilePath,
    ignoredFiles: ignoredFiles()
  };
};
