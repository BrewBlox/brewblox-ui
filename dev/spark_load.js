const fs = require('fs');
const axios = require('axios');
const Minimist = require('minimist');
const { host, fileDir, sparks, retry } = require('./utils');

// Save all services if not further specified
const args = Minimist(process.argv.slice(2))._;
const services = args.length > 0 ? args : sparks;

async function run() {
  for (let svc of services) {
    const fname = `${fileDir}/${svc}.spark.json`;
    const backup = JSON.parse(fs.readFileSync(fname));
    await retry(`Loading ${svc} blocks`, () =>
      axios.post(`${host}/${svc}/blocks/backup/load`, backup),
    );
    console.log('Spark blocks loaded', fname);
  }
}

run()
  .then(() => console.log('Script done!', __filename))
  .catch((e) => console.log(e));
