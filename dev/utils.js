const path = require('path');

console.log(
  'Disabling NODE_TLS_REJECT_UNAUTHORIZED to allow using the self-signed certificate.',
  'You can ignore the warning.');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function retry(desc, func) {
  const start = new Date().getTime();
  while (new Date().getTime() < start + 5 * 60 * 1000) {
    try {
      return await func();
    } catch (e) {
      console.log(`Retrying "${desc}" after error,`, e.message);
      await sleep(1000);
    }
  }
  throw new Error(`Retry attempts exhausted: "${desc}"`);
};

const host = 'https://localhost:9001';
const datastore = `${host}/datastore`;

module.exports = {
  sleep,
  retry,
  host,
  datastore,
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
