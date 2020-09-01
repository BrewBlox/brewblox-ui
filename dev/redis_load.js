const axios = require('axios');
const fs = require('fs');
const { host, retry, databases, fileDir } = require('./utils');
const get = require('lodash/get');

async function run() {
  await retry('Waiting for datastore', () => axios.get(`${host}/history/ping`));

  for (let db of databases) {
    const url = `${host}/history/datastore`;
    const fname = `${fileDir}/${db}.datastore.json`;
    const docs = JSON.parse(fs.readFileSync(fname))
      .map(doc => {
        doc.id = doc._id.replace(/^(.+)__/, '$1:');
        delete doc._id;
        return doc;
      });

    await axios.post(`${url}/mdelete`, {
      namespace: db,
      filter: '*',
    });

    await axios.post(`${url}/mset`, {
      namespace: db,
      values: docs,
    });
    console.log('Database loaded', fname);
  }
};

run()
  .then(() => console.log('Script done!', __filename))
  .catch(e => console.log(get(e, 'response.data', e)));
