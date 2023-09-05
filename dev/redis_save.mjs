import axios from 'axios';
import get from 'lodash/get';
import {
  databases,
  datastore,
  fileDir,
  objectSorter,
  retry,
} from './utils.mjs';

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
  .then(() => console.log('Script done!', import.meta.url))
  .catch((e) => console.log(get(e, 'response.data', e)));
