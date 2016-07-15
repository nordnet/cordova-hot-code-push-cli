import appConfigInit from './app_config';
import amazonConfigInit from './amazon_config';
import ftpConfigInit from './ftp_config';

const execute = (context) => {
  const configType = context.argv._[1];
  let executionResult;
  if (configType === 'amazon-config') {
    // TBD
  } else if (configType === 'ftp-config') {
    // TBD
  } else {
    executionResult = appConfigInit(context);
  }

  return executionResult;
};

export default execute;
