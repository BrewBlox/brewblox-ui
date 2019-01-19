const fs = require('fs');
const request = require('request-promise-native');
require('dotenv').config({ path: '.env.development' });

// Ignore errors about our self-signed certificate
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const [, , dir, ...modules] = process.argv;
const host = `${process.env.VUE_APP_API_URI}/datastore`;
const database = 'brewblox-ui-store';

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

const recreateDatabase = async () => {
  try {
    await request.delete(`${host}/${database}`);
  } catch (e) {
    // pass
  }
  console.log(await retry('create database', async () => {
    return await request.put(`${host}/${database}`);
  }));
};

const resetModule = async (mod) => {
  const content = JSON.parse(fs.readFileSync(`${dir}/${mod}.json`, 'utf8'));
  content.docs = content.docs
    .map(obj => ({ ...obj, _id: `${mod}__${obj._id}` }));
  console.log(await retry(`insert ${mod} docs`, async () => {
    return await request.post({
      uri: `${host}/${database}/_bulk_docs`,
      json: content,
      timeout: 70000,
    });
  }));
};

const resetDatastore = async () => {
  await resetSettings();
  await recreateDatabase();
  await Promise
    .all(modules.map(resetModule));
};

resetDatastore()
  .then(() => {
    console.log(`Succesfully reset datastore`);
  })
  .catch((e) => {
    console.log(e);
  });
