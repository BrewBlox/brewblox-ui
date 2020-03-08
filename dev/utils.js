const path = require('path');

// Ignore errors about our self-signed certificate
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retry = async (desc, func) => {
  for (i = 0; i < 10; i++) {
    try {
      return await func();
    } catch (e) {
      console.log(`Retrying ${desc} after error,`, e.message);
      await sleep(1000);
    }
  }
  throw new Error(`Retry attempts exhausted: ${desc}`);
};

module.exports = {
  sleep,
  retry,
  datastore: 'https://localhost:9001/datastore',
  fileDir: path.resolve(__dirname, './presets'),
  databases: [
    'brewblox-automation',
    'brewblox-ui-store',
  ],
};
