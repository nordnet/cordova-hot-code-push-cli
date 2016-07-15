import path from 'path';
import utils from '../utils';

const loginFile = path.join(process.cwd(), '.chcplogin');

const schema = {
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

const done = () => {
  console.log('.chcplogin file created. Don\'t forget to add it to your .gitignore.');
};

const execute = (context) => {
  utils.getInput(schema, context.argv)
    .then(content => utils.writeFile(loginFile, content))
    .then(done);
};

export default execute;
