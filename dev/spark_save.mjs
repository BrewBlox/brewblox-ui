import { writeFileSync } from 'fs';
import axios from 'axios';
import Minimist from 'minimist';
import { fileDir, host, objectSorter, sparks } from './utils.mjs';

// Save all services if not further specified
const args = Minimist(process.argv.slice(2))._;
const services = args.length > 0 ? args : sparks;

async function run() {
  for (let svc of services) {
    const resp = await axios.post(`${host}/${svc}/blocks/backup/save`);
    resp.data.blocks.sort(objectSorter('id'));
    const fname = `${fileDir}/${svc}.spark.json`;
    writeFileSync(fname, JSON.stringify(resp.data, undefined, 2));
    console.log('Spark blocks saved', fname);
  }
}

run()
  .then(() => console.log('Script done!', import.meta.url))
  .catch((e) => console.log(e));
