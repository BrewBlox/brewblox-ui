const axios = require('axios');
const fs = require('fs');
const { host, retry, databases, fileDir } = require('./utils');
const get = require('lodash/get');

async function run() {
  await retry('Waiting for datastore', () => axios.get(`${host}/history/ping`));

  for (let db of databases) {
    const url = `${host}/history/datastore`;
    const docs = await axios
      .post(`${url}/mget`, {
        namespace: db,
        filter: '*',
      })
      .then(resp => resp.data);

    const fname = `${fileDir}/${db}.redis.json`;
    fs.writeFileSync(fname, JSON.stringify(docs, undefined, 2));
    console.log('Database saved', fname);
  }
};

run()
  .then(() => console.log('Script done!', __filename))
  .catch(e => console.log(get(e, 'response.data', e)));
