const axios = require('axios');
const fs = require('fs');
const { datastore, retry, databases, fileDir } = require('./utils');
const get = require('lodash/get');

async function run() {
  await retry('Waiting for redis', () => axios.get(`${datastore}/ping`));

  for (let db of databases) {
    const fname = `${fileDir}/${db}.redis.json`;
    const docs = JSON.parse(fs.readFileSync(fname));

    await axios.post(`${datastore}/mdelete`, {
      namespace: db,
      filter: '*',
    });

    await axios.post(`${datastore}/mset`, {
      values: docs,
    });

    console.log('Database loaded', fname);
  }
}

run()
  .then(() => console.log('Script done!', __filename))
  .catch((e) => console.log(get(e, 'response.data', e)));
