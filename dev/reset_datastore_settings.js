/* eslint-disable @typescript-eslint/no-var-requires */
const request = require('request-promise-native');
require('dotenv').config({ path: '.env.development' });
/* eslint-enable */

// Ignore errors about our self-signed certificate
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const host = `${process.env.VUE_APP_API_URI}/datastore`;

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

const resetSettings = async () => {
  const resp = await retry('settings', async () => {
    await request.put({
      uri: `${host}/_node/_local/_config/httpd/enable_cors`,
      body: '"true"',
    });
    await request.put({
      uri: `${host}/_node/_local/_config/cors/origins`,
      body: '"*"',
    });
    await request.put({
      uri: `${host}/_node/_local/_config/cors/credentials`,
      body: '"true"',
    });
    await request.put({
      uri: `${host}/_node/_local/_config/cors/methods`,
      body: '"GET, PUT, POST, HEAD, DELETE"',
    });
    await request.put({
      uri: `${host}/_node/_local/_config/cors/headers`,
      body: '"accept, authorization, content-type, origin, referer, x-csrf-token"',
    });
    return 'Datastore CORS settings set';
  });
  console.log(resp);
};

resetSettings()
  .then(() => {
    console.log('Succesfully reset datastore settings');
  })
  .catch((e) => {
    console.log(e);
  });
