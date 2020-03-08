const axios = require('axios');
const { datastore, retry } = require('./utils');

const resetSettings = async () => {
  const resp = await retry('settings', async () => {

    // Create system database files
    await Promise.all([
      axios.put(`${datastore}/_users`),
      axios.put(`${datastore}/_replicator`),
      axios.put(`${datastore}/_global_changes`),
    ].map(p => p.catch(() => { })));

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
    return 'Datastore configured';
  });
  console.log(resp);
};

resetSettings()
  .then(() => {
    console.log('Succesfully reset datastore settings');
  })
  .catch((e) => {
    console.log(e);
  });
