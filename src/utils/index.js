import pify from 'pify';
import _fs from 'fs';
import recursive from 'recursive-readdir';
import hidefile from 'hidefile';
import prompt from 'prompt';

const fs = pify(_fs);

// const getInput = (prompt, props) => {
//   return new Promise(resolve => prompt.get(props, (err, result) => resolve(result, err)));
// };

const getInput = (schema, argv) => {
  prompt.override = argv;
  prompt.message = 'Please provide';
  prompt.delimiter = ': ';
  prompt.start();

  return pify(prompt).get(schema);
};

const readFile = (file) => {
  return fs.readFile(file, 'utf8').then(content => JSON.parse(content));
};

const writeFile = (file, content) => {
  const str = JSON.stringify(content, null, 2);

  return fs.writeFile(file, str, 'utf8');
}

const nonHiddenFile = (file) => {
  return !hidefile.isHiddenSync(file);
}

const readDir = (dir, ignoredFiles) => {
  return new Promise((resolve, reject) => {
      recursive(dir, ignoredFiles, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    })
    .then(files => files.filter(nonHiddenFile));
};

export default {
  getInput,
  readFile,
  writeFile,
  readDir
};
