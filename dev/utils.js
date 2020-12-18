const path = require('path');

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

const host = 'http://localhost:9000';

module.exports = {
  sleep,
  retry,
  host,
  history: `${host}/history/history`,
  datastore: `${host}/history/datastore`,
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
