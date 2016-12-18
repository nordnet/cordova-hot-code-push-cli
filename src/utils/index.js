import pify from 'pify';
import _fs from 'fs';
import _recursive from 'recursive-readdir';
import hidefile from 'hidefile';
import prompt from 'prompt';
import R from 'ramda';

const fs = pify(_fs);
const recursive = pify(_recursive);

const getInput = R.curry(
  (schema, argv) => {
    prompt.override = argv;
    prompt.message = 'Please provide';
    prompt.delimiter = ': ';
    prompt.start();

    return pify(prompt).get(schema);
  }
);

const readFile = file => fs.readFile(file, 'utf8').then(JSON.parse);

const stringify = content => JSON.stringify(content, null, 2);

const writeFile = R.curry(
  (file, content) => fs.writeFile(file, stringify(content), 'utf8')
);

const nonHiddenFile = file => !hidefile.isHiddenSync(file);

const readDir = (dir, ignoredFiles) => recursive(dir, ignoredFiles).then(R.filter(nonHiddenFile));

const generateReleaseNumber = () => Math.floor(new Date() / 1000);

const lib = {
  getInput,
  readFile,
  writeFile,
  readDir,
  generateReleaseNumber,
};

export default lib;