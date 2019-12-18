/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const request = require('request-promise-native');

// Ignore errors about our self-signed certificate
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const fileName = process.argv[2];
const service = process.argv[3];
const host = 'https://localhost:9001';

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const resetObjects = async () => {
  const content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
  for (i = 0; i < 10; i++) {
    try {
      const resp = await request.post({
        uri: `${host}/${service}/import_objects`,
        json: content,
        timeout: 70000,
      });
      console.log(resp);
      return;
    } catch (e) {
      console.log('Retrying after error,', e.message);
      await sleep(1000);
    }
  }
  throw new Error('Retry attempts exhausted');
};

resetObjects()
  .then(() => {
    console.log(`Succesfully imported objects for ${service}`);
  })
  .catch((e) => {
    console.log(e);
  });
