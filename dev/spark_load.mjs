import { readFileSync } from 'fs';
import axios from 'axios';
import Minimist from 'minimist';
import { fileDir, host, retry, sparks } from './utils.mjs';

// Save all services if not further specified
const args = Minimist(process.argv.slice(2))._;
const services = args.length > 0 ? args : sparks;

async function run() {
  for (let svc of services) {
    const fname = `${fileDir}/${svc}.spark.json`;
    const backup = JSON.parse(readFileSync(fname));
    await retry(`Loading ${svc} blocks`, () =>
      axios.post(`${host}/${svc}/blocks/backup/load`, backup),
    );
    console.log('Spark blocks loaded', fname);
  }
}

run()
  .then(() => console.log('Script done!', import.meta.url))
  .catch((e) => console.log(e));
