import fs from 'fs';

export function getInput(prompt, props) {
  return new Promise(resolve => prompt.get(props, (err, result) => resolve(result, err)));
}

export function writeFile(file, content) {
  return new Promise((resolve, reject) => {
    var data = JSON.stringify(content, null, 2);
    fs.writeFile(file, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
