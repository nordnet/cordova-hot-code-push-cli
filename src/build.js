import path from 'path';
import md5File from 'md5-file';
import utils from './utils';

const backslashRegexp = new RegExp("\\\\", "g");

const stringify = (json) => {
  return JSON.stringify(json, null, 2);
};

const generateReleaseVersionNumber = () => {
  return Math.floor(new Date() / 1000);
};

const getConfig = (context) => {
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
    hash: hash
  };
};

const sortByLocale = (a, b) => {
  return a.file.localeCompare(b.file);
};

const generateHashes = (files, context) => {
  return files.map((file) => generateFileHash(file, context)).sort(sortByLocale);
};

const createManifestFile = (hashes, context) => {
  return utils.writeFile(context.manifestFilePath, hashes);
};

const saveConfig = (config, context) => {
  return utils.writeFile(context.projectsConfigFilePath, config).then(_ => config);
};

const done = (config, context) => {
  console.log(`Build with release version ${config.release} created in ${context.sourceDirectory}`);
};

const readSourceDir = (context) => {
  return utils.readDir(context.sourceDirectory, context.ignoredFiles);
};

const execute = (context) => {
  return readSourceDir(context)
    .then(files => generateHashes(files, context))
    .then(hashes => createManifestFile(hashes, context))
    .then(_ => getConfig(context))
    .then(config => saveConfig(config, context))
    .then(config => done(config, context));
}

export default execute;
