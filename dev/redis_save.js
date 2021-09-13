const axios = require('axios');
const fs = require('fs');
const { datastore, retry, databases, fileDir, objectSorter } = require('./utils');
const get = require('lodash/get');

async function run() {
  await retry('Waiting for datastore', () => axios.get(`${datastore}/ping`));

  for (let db of databases) {
    const docs = await axios
      .post(`${datastore}/mget`, {
        namespace: db,
        filter: '*',
      })
      .then((resp) => resp.data.values)
      .then((values) => values.sort(objectSorter('id')));

    const fname = `${fileDir}/${db}.redis.json`;
    fs.writeFileSync(fname, JSON.stringify(docs, undefined, 2));
    console.log('Database saved', fname);
  }
}

run()
  .then(() => console.log('Script done!', __filename))
  .catch((e) => console.log(get(e, 'response.data', e)));
