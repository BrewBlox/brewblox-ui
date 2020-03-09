const path = require('path');

console.log(
  'Disabling NODE_TLS_REJECT_UNAUTHORIZED to allow using the self-signed certificate.',
  'You can ignore the warning.');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function retry(desc, func) {
  for (i = 0; i < 10; i++) {
    try {
      return await func();
    } catch (e) {
      console.log(`Retrying "${desc}" after error,`, e.message);
      await sleep(1000);
    }
  }
  throw new Error(`Retry attempts exhausted: "${desc}"`);
};

module.exports = {
  sleep,
  retry,
  host: 'https://localhost:9001',
  datastore: 'https://localhost:9001/datastore',
  fileDir: path.resolve(__dirname, 'presets'),
  databases: [
    'brewblox-automation',
    'brewblox-ui-store',
  ],
  sparks: [
    'sparkey',
    'spock',
  ],
};
