import utils from '../utils';
import path from 'path';
import prompt from 'prompt';
import R from 'ramda';

const isShortVersion = {
  description: 'Would you like a short or full version?',
  default: 'short',
  message: 'allowed: short, full',
  pattern: /(short|full)/,
  before: value => value === 'short'
};

const contentDir = {
  description: 'Content directory path',
  message: 'Provide a url (or relative path on the server), where your web content is located',
  required: true
};

const contentConfig = {
  description: 'Application\'s config URL (skip, if it\'s in content\'s directory root)',
  ask: () => !prompt.history('isShortVersion').value,
  before: value => {
    if (value) {
      return value;
    }

    let contentDirUrl = prompt.history('contentDir').value;
    if (contentDirUrl.indexOf('/') !== contentDirUrl.length - 1) {
      contentDirUrl += '/';
    }

    return `${contentDirUrl}chcp.json`;
  }
};

const releaseVersionsCompare = {
  description: 'How release versions should be compared?',
  message: 'allowed: !=, >, <',
  pattern: /(!=|>|<)/,
  default: '!=',
  ask: () => !prompt.history('isShortVersion').value
};

const minNativeInterface = {
  description: 'Required version of the native side',
  default: 1,
  ask: () => !prompt.history('isShortVersion').value
};

const autoDownload = {
  description: 'Is auto download enabled? (y/n)',
  pattern: /(y|n)/,
  message: '\'y\' or \'n\'',
  default: 'y',
  before: value => value === 'y',
  ask: () => !prompt.history('isShortVersion').value
};

const autoDownloadPhase = {
  description: 'When update download should be performed?',
  pattern: /(onstart|onresume)/,
  message: 'allowed: onstart, onresume',
  default: 'onstart',
  ask: () => !prompt.history('isShortVersion').value && prompt.history('autoDownload').value
};

const autoInstall = {
  description: 'Is auto install enabled? (y/n)',
  pattern: /(y|n)/,
  message: 'should be \'y\' or \'n\'',
  default: 'y',
  before: value => value === 'y',
  ask: () => !prompt.history('isShortVersion').value
};

const autoInstallPhase = {
  description: '',
  pattern: /(onstart|onresume|ondownload)/,
  message: 'allowed: onstart, onresume, ondownload',
  default: 'onstart',
  ask: () => !prompt.history('isShortVersion').value && prompt.history('autoInstall').value
};

const pathToSourceDir = {
  description: 'Where to put generated config?',
  default: 'www'
};

const schema = {
  properties: {
    isShortVersion,
    contentDir,
    contentConfig,
    releaseVersionsCompare,
    minNativeInterface,
    autoDownload,
    autoDownloadPhase,
    autoInstall,
    autoInstallPhase,
    pathToSourceDir
  }
};

const generateFullConfig = input => {
  const config = {
    release: {
      version: utils.generateReleaseNumber(),
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

const generateShortConfig = input => {
  return {
    config: {
      release: utils.generateReleaseNumber(),
      content: input.contentDir
    },
    dst: input.pathToSourceDir
  };
};

const generateConfig = userInput => userInput.isShortVersion ? generateShortConfig(userInput) : generateFullConfig(userInput);

const saveConfig = config => {
  const pathToConfig = path.join(process.cwd(), config.dst, 'chcp.json');

  return utils.writeFile(pathToConfig, config.config).then(_ => config);
};

const done = config => {
  console.log(`Generated new application\'s config in ${config.dst}:`);
  console.log(JSON.stringify(config.config, null, 2));
};

const requestUserInput = utils.getInput(schema);

const execute = context => {
  console.log('Initializing application\'s config');

  return R.pipeP(
    requestUserInput,
    generateConfig,
    saveConfig,
    done
  )(context.argv);
};

export default execute;