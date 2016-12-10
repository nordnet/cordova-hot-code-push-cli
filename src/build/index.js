import path from 'path';
import md5File from 'md5-file';
import utils from '../utils';

const backslashRegexp = new RegExp('\\\\', 'g');

const generateReleaseVersionNumber = () => Math.floor(new Date() / 1000);

const getConfig = context => {
  const pathToConfig = path.join(context.sourceDirectory, 'chcp.json');

  return utils.readFile(pathToConfig).catch(_ => {
    return {};
  }).then(config => {
    config.release = generateReleaseVersionNumber();
    return config;
  });
};

const generateFileHash = (file, context) => {
  const relFilePath = path.relative(context.sourceDirectory, file).replace(backslashRegexp, "/");
  const hash = md5File.sync(file);

  return {
    file: relFilePath,
    hash
  };
};

const sortByLocale = (a, b) => a.file.localeCompare(b.file);

const generateHashes = (files, context) => files.map((file) => generateFileHash(file, context)).sort(sortByLocale);

const createManifestFile = (hashes, context) => utils.writeFile(context.manifestFilePath, hashes);

const saveConfig = (config, context) => utils.writeFile(context.projectsConfigFilePath, config).then(_ => config);

const done = (config, context) => {
  console.log(`Build with release version ${config.release} created in ${context.sourceDirectory}`);

  return config;
};

const readSourceDir = context => utils.readDir(context.sourceDirectory, context.ignoredFiles);

const execute = context => readSourceDir(context)
    .then(files => generateHashes(files, context))
    .then(hashes => createManifestFile(hashes, context))
    .then(_ => getConfig(context))
    .then(config => saveConfig(config, context))
    .then(config => done(config, context));

export default execute;
