const axios = require('axios');
const { host, retry } = require('./utils');

const datastore = `${host}/datastore`;

async function run() {
  await retry('Waiting for datastore', () => axios.get(datastore));

  // Create system database files
  await axios.put(`${datastore}/_users`).catch(() => { });
  await axios.put(`${datastore}/_replicator`).catch(() => { });
  await axios.put(`${datastore}/_global_changes`).catch(() => { });

  await axios({
    method: 'put',
    url: `${datastore}/_node/_local/_config/httpd/enable_cors`,
    data: '"true"',
  });
  await axios({
    method: 'put',
    url: `${datastore}/_node/_local/_config/cors/origins`,
    data: '"*"',
  });
  await axios({
    method: 'put',
    url: `${datastore}/_node/_local/_config/cors/credentials`,
    data: '"true"',
  });
  await axios({
    method: 'put',
    url: `${datastore}/_node/_local/_config/cors/methods`,
    data: '"GET, PUT, POST, HEAD, DELETE"',
  });
  await axios({
    method: 'put',
    url: `${datastore}/_node/_local/_config/cors/headers`,
    data: '"accept, authorization, content-type, origin, referer, x-csrf-token"',
  });
  console.log('Datastore configured');
};

run()
  .then(() => console.log('Script done!', __filename))
  .catch(e => console.log(e));
