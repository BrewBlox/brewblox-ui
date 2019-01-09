const fs = require('fs');
const request = require('request-promise-native');
require('dotenv').config({path: '.env.development'});

// Ignore errors about our self-signed certificate
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const fileName = process.argv[2];
const service = process.argv[3];
const host = process.env.VUE_APP_API_URI;

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const resetObjects = async () => {
  const content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
  for (i = 0; i < 10; i++) {
    try {
      const resp = await request.post({
        uri: `${host}/${service}/reset_objects`,
        json: content,
        timeout: 5000,
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
      console.log(`Succesfully reset objects for ${service}`);
    })
    .catch((e) => {
      console.log(e);
    });
