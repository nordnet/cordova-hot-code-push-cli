import path from 'path';
import prompt from 'prompt';
import fs from 'fs';

import { getInput, writeFile } from './utils';

const configFile = path.join(process.cwd(), 'cordova-hcp.json');
const loginFile = path.join(process.cwd(), '.chcplogin');

const ftpSchema = {
  properties: {
    host: {
      description: 'Enter FTP host (required)',
      message: 'FTP host',
      required: true,
    },
    port: {
      description: 'Enter FTP port',
      message: 'FTP port',
      required: false,
      default: 21
    },
    path: {
      description: 'Enter FTP path to your app',
      message: 'FTP path',
      required: true
    },
    username: {
      description: 'Enter FTP username (required)',
      message: 'FTP username',
      required: true,
    },
    password: {
      description: 'Enter FTP password (required)',
      message: 'FTP password',
      hidden: true,
      required: true,
    },
  }
};

const s3Schema = {
  properties: {
    key: {
      description: 'Amazon Access Key Id',
      message: 'You need to provide the Amazon Access Key Id',
      required: true,
    },
    secret: {
      description: 'Amazon Secret Access Key',
      message: 'You need to provide the Secret Access Key',
      required: true,
    },
  },
};

const loginSchema = {
  properties: {
    pushMode: {
      description: 'Choose a method to push your code: (s3 | ftp)',
      message: 'You need to choose a method to push your code',
      required: true,
      pattern: /(s3|ftp)/,
      default: 's3'
    }
  },
};

export function execute(context) {
  validateConfig();

  prompt.override = context.argv;
  prompt.message = 'Please provide';
  prompt.delimiter = ': ';
  prompt.start();

  getInput(prompt, loginSchema)
    .then(res => getPushSchemaInput(pushModeToSchema(res.pushMode), res));
}

function getPushSchemaInput(schema, res) {
    getInput(prompt, schema)
      .then(content => ({
        pushMode: res.pushMode,
        [res.pushMode]: content
       }))
      .then(content => writeFile(loginFile, content))
      .then(done);
}

function validateConfig() {
  let config;

  try {
    config = fs.readFileSync(configFile);
  } catch(e) {
    console.log('Cannot parse cordova-hcp.json. Did you run cordova-hcp init?');
    process.exit(0);
  }

  if (!config) {
    console.log('You need to run "cordova-hcp init" before you can run "cordova-hcp login".');
    console.log('Both commands needs to be invoked in the root of the project directory.');
    process.exit(0); // eslint-disable-line no-process-exit
  }
}

function done(err) {
  if (err) {
    return console.log(err);
  }

  console.log('Project initialized and .chcindex.plogin file created.');
  console.log('You SHOULD add .chcplogin to your .gitignore');
  console.log('( echo \'.chcplogin\' >> .gitignore )');
}

function pushModeToSchema(pushMode) {
    switch (pushMode) {
        case 'ftp':
            return ftpSchema;
        case 's3':
        default:
            return s3Schema;
    }
}
