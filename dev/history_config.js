const axios = require('axios');
const { host, retry } = require('./utils');

async function run() {
  await retry('Wait for history service', async () => {
    await axios.get(`${host}/history/ping`);
  });
  await axios.post(`${host}/history/query/configure`);
}

run()
  .then(() => console.log('Script done!', __filename))
  .catch(e => console.log(e));
