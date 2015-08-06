import fs from 'fs';

export function getInput(prompt, props) {
  return new Promise(resolve => prompt.get(props, (err, result) => resolve(result, err)));
}

export function writeFile(file, content) {
  return new Promise(resolve => fs.writeFile(file, JSON.stringify(content, null, 2), err => resolve(err)));
}
