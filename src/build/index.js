import path from 'path';
import md5File from 'md5-file';
import utils from '../utils';
import R from 'ramda';

const backslashRegexp = new RegExp('\\\\', 'g');

const pathToConfig = dir => path.join(dir, 'chcp.json');

const getConfig = context => () => {
  const configPath = pathToConfig(context.sourceDirectory);

  return utils.readFile(configPath).catch(_ => {
    return {};
  }).then(config => {
    config.release = utils.generateReleaseNumber();
    return config;
  });
};

const generateFileHash = R.curry(
  (context, file) => {
    const relFilePath = path.relative(context.sourceDirectory, file).replace(backslashRegexp, "/");
    const hash = md5File.sync(file);

    return {
      file: relFilePath,
      hash
    };
  }
);

const sortByLocale = (a, b) => a.file.localeCompare(b.file);

const generateHashes = R.curry(
  (context, files) => files.map(generateFileHash(context)).sort(sortByLocale)
);

const createManifestFile = R.curry(
  (context, hashes) => utils.writeFile(context.manifestFilePath, hashes)
);

const saveConfig = R.curry(
  (context, config) => utils.writeFile(context.projectsConfigFilePath, config).then(_ => config)
);

const done = R.curry(
  (context, config) => {
    console.log(`Build with release version ${config.release} created in ${context.sourceDirectory}`);

    return config;
  }
);

const readSourceDir = context => utils.readDir(context.sourceDirectory, context.ignoredFiles);

const execute = context => R.pipeP(
  readSourceDir,
  generateHashes(context),
  createManifestFile(context),
  getConfig(context),
  saveConfig(context),
  done(context)
)(context);

export default execute;