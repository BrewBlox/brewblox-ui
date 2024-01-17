import { readFileSync } from 'fs';
import axios from 'axios';
import get from 'lodash/get.js';
import { databases, datastore, fileDir, retry } from './utils.mjs';

async function run() {
  await retry('Waiting for redis', () => axios.get(`${datastore}/ping`));

  for (let db of databases) {
    const fname = `${fileDir}/${db}.redis.json`;
    const docs = JSON.parse(readFileSync(fname));

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
  .then(() => console.log('Script done!', import.meta.url))
  .catch((e) => console.log(get(e, 'response.data', e)));
