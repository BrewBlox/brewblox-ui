const fs = require('fs');
const axios = require('axios');
const Minimist = require('minimist');
const { host, fileDir, sparks } = require('./utils');

// Save all services if not further specified
const args = Minimist(process.argv.slice(2))._;
const services = args.length > 0 ? args : sparks;

async function run() {
  for (let svc of services) {
    const resp = await axios.get(`${host}/${svc}/export_objects`);
    const fname = `${fileDir}/${svc}.spark.json`;
    fs.writeFileSync(fname, JSON.stringify(resp.data, undefined, 2));
    console.log('Spark blocks saved', fname);
  }
};

run()
  .then(() => console.log('Script done!', __filename))
  .catch(e => console.log(e));
