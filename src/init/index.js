import appConfigInit from './app_config';
import amazonConfigInit from './amazon_config';
import ftpConfigInit from './ftp_config';

const execute = context => {
  const configType = context.argv._[1];
  if (configType === 'amazon-config') {
    // TBD
  } else if (configType === 'ftp-config') {
    // TBD
  } else {
    return appConfigInit(context);
  }
};

export default execute;
